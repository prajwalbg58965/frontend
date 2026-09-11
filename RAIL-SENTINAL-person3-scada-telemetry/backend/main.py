import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from scada_simulator import scada_sim
from verification_engine import VerificationEngine
from train_monitor import train_monitor
from alert_manager import alert_manager

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

verification_engine = VerificationEngine()

# Connection manager for WebSockets
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except WebSocketDisconnect:
                self.disconnect(connection)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    # Start background simulations
    asyncio.create_task(scada_sim.run())
    asyncio.create_task(train_monitor.run())
    asyncio.create_task(alert_manager.run_escalation_checker())
    asyncio.create_task(broadcast_state_loop())

async def broadcast_state_loop():
    while True:
        await asyncio.sleep(1.0)

        # Get Train Monitor state first -- Layer 1 occupancy is derived
        # from the primary monitored train's REAL live position, so this
        # has to run before we read SCADA state.
        train_state = train_monitor.get_state()
        layer3_alerts = train_monitor.check_convergence()

        primary_id = train_monitor.monitored_trains[0] if train_monitor.monitored_trains else None
        primary_train = train_state.get("trains", {}).get(primary_id) if primary_id else None
        scada_sim.sync_with_real_train(primary_train)

        # Get SCADA state and verify Layer 1
        scada_state = scada_sim.get_state()
        layer1_alerts = verification_engine.verify_layer_1(scada_state)

        # Process alerts
        all_new_alerts = layer1_alerts + layer3_alerts
        alert_manager.process_new_alerts(all_new_alerts)

        # Build composite payload
        payload = {
            "scada": scada_state,
            "trains": train_state,
            "alerts": alert_manager.get_all_alerts()
        }

        await manager.broadcast(json.dumps(payload))

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/inject_signal_mismatch")
def inject_signal_mismatch():
    scada_sim.inject_fault()
    return {"status": "Fault injected: Signal Mismatch (Balasore-style)"}

@app.post("/api/resolve_signal_mismatch")
def resolve_signal_mismatch():
    scada_sim.resolve_fault()
    return {"status": "Fault resolved: Signal Mismatch"}

@app.post("/api/inject_converging_trains")
def inject_converging_trains():
    train_monitor.inject_fault()
    return {"status": "Fault injected: Converging Trains"}

@app.post("/api/resolve_converging_trains")
def resolve_converging_trains():
    train_monitor.resolve_fault()
    return {"status": "Fault resolved: Converging Trains"}

@app.post("/api/acknowledge_alert/{alert_id}")
def acknowledge_alert(alert_id: str):
    success = alert_manager.acknowledge_alert(alert_id)
    if success:
        return {"status": "success", "message": f"Alert {alert_id} acknowledged."}
    else:
        return {"status": "error", "message": "Alert not found or already processed."}

# ---- New endpoints ----

@app.get("/api/route/{train_number}")
async def get_route(train_number: str):
    route = train_monitor.get_cached_route(train_number)
    return route or {"error": "Route not found"}

@app.get("/api/escalation_status")
def escalation_status():
    return {
        "escalation_timeout": alert_manager.escalation_timeout,
        "escalated_alerts": [a for a in alert_manager.get_all_alerts() if a["status"] == "Escalated"]
    }

@app.post("/api/escalation_config")
def escalation_config(timeout: int = 15, phone: str = ""):
    alert_manager.escalation_timeout = timeout
    if phone:
        import escalation
        escalation.ESCALATION_TARGET = phone
    return {"status": "ok", "timeout": timeout}

from pydantic import BaseModel
class TrainList(BaseModel):
    trains: list[str]

@app.post("/api/set_trains")
def set_trains(payload: TrainList):
    train_monitor.set_monitored_trains(payload.trains)
    return {"status": "ok", "trains": train_monitor.monitored_trains}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
