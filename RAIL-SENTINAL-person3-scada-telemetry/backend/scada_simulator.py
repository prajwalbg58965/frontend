import asyncio
import time
from typing import Optional, Dict, Any


class SCADASimulator:
    """
    Layer 1 telemetry source.

    Design principle: simulate only what genuinely cannot be sourced from
    real data, and derive everything else from a real train.

    - Track occupancy (tracks T1..T4) is NOT randomly generated. It is
      derived from a real, live train's actual position along its actual
      route, fetched from RailRadar by train_monitor. The route is divided
      into NUM_SECTIONS block sections by real distance travelled
      (distanceFromOriginKm / totalDistanceKm), and whichever section the
      real train is currently in is marked occupied.

    - Point machine position (P1/P2) and the interlocking's *reported*
      signal aspect are simulated, because no public API exposes
      interlocking-internal / point-machine telemetry. This is the one
      piece of the system that genuinely has to be simulated -- and it
      mirrors the actual Balasore failure mode: a point machine
      wiring/configuration mismatch that caused the interlocking to report
      a signal aspect that didn't match physical reality.

    verification_engine.py never looks at this class's fault flag -- it
    only sees "points" and "signals" and independently recomputes what the
    signal *should* be from "tracks" + "points", exactly like a real
    independent verification layer would.
    """

    NUM_SECTIONS = 4  # T1..T4, mapped onto % of the real train's route

    def __init__(self):
        self.tracks: Dict[str, bool] = {f"T{i+1}": False for i in range(self.NUM_SECTIONS)}
        self.points: Dict[str, str] = {"P1": "normal", "P2": "normal"}
        self.signals: Dict[str, str] = {"S1": "green", "S2": "green"}
        self.fault_active = False

        # Provenance -- which real train is currently driving occupancy,
        # and how far along its real route it is. Surfaced to the frontend
        # so the demo can show this isn't a made-up train.
        self.source_train: Optional[str] = None
        self.source_train_name: Optional[str] = None
        self.source_progress_pct: float = 0.0
        self.last_real_sync: float = 0.0

    def sync_with_real_train(self, train_info: Optional[Dict[str, Any]]):
        """
        Called every tick (from main.py's broadcast loop) with the primary
        monitored train's live RailRadar data. Recomputes real occupancy
        from real distance travelled. No-op while a fault is being
        demonstrated, so the injected fault state stays stable and visible
        for the demo instead of being overwritten every second.
        """
        if self.fault_active or not train_info:
            return

        dist = train_info.get("distanceFromOriginKm") or 0
        total = train_info.get("totalDistanceKm") or 0
        pct = (dist / total) if total > 0 else 0.0
        pct = max(0.0, min(1.0, pct))

        self.source_train = train_info.get("trainNumber")
        self.source_train_name = train_info.get("trainName")
        self.source_progress_pct = pct
        self.last_real_sync = time.time()

        section_idx = min(self.NUM_SECTIONS - 1, int(pct * self.NUM_SECTIONS))
        for i in range(self.NUM_SECTIONS):
            self.tracks[f"T{i+1}"] = (i == section_idx)

        self._recompute_reported_signals()

    def _recompute_reported_signals(self):
        """
        This represents what the STATION INTERLOCKING reports -- i.e. the
        thing Layer 1 is supposed to independently double-check. In the
        no-fault state it follows correct interlocking rules, same as
        verification_engine's independent calculation would expect.
        """
        expected_s1 = "green"
        if self.points["P1"] == "normal" and self.tracks["T2"]:
            expected_s1 = "red"
        elif self.points["P1"] == "reverse" and self.tracks["T3"]:
            expected_s1 = "red"
        self.signals["S1"] = expected_s1
        self.signals["S2"] = "red" if self.tracks["T4"] else "green"

    def get_state(self):
        return {
            "type": "scada_state",
            "timestamp": time.time(),
            "tracks": self.tracks,
            "points": self.points,
            "signals": self.signals,
            "fault_active": self.fault_active,
            "source_train": self.source_train,
            "source_train_name": self.source_train_name,
            "source_progress_pct": round(self.source_progress_pct * 100, 1),
        }

    def inject_fault(self):
        """
        Simulates the Balasore-class failure: a maintenance/configuration
        change leaves the point machine physically set to 'reverse' while
        the interlocking still reports the mainline signal (S1) as green --
        a mismatch that should never be possible if verification worked.
        Real track occupancy (frozen at whatever the real train's last
        synced section was) is left mostly untouched, so the demo shows a
        real train's real position combined with an injected interlocking
        fault, not a fully fake scene.
        """
        self.fault_active = True
        self.tracks["T2"] = True  # hold: a train is "on" the protected section
        self.points["P1"] = "reverse"
        self.signals["S1"] = "green"  # WRONG per interlocking rules -- this is the injected fault

    def resolve_fault(self):
        self.fault_active = False
        self.points["P1"] = "normal"
        self._recompute_reported_signals()

    async def run(self):
        # Occupancy is now driven externally by sync_with_real_train(),
        # called from main.py's broadcast loop once per tick. This task is
        # kept only so main.py's asyncio.create_task(scada_sim.run()) call
        # doesn't need to change.
        while True:
            await asyncio.sleep(3600)


scada_sim = SCADASimulator()
