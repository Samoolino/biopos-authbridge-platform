import express from "express";
import { IdentityService } from "../../../services/identity-service/src";
import { AuthenticationService } from "../../../services/auth-service/src";
import { PolicyEngine } from "../../../services/policy-engine/src";
import { ConsentService } from "../../../services/consent-service/src";
import { TransactionOrchestrator } from "../../../services/transaction-orchestrator/src";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "biopos-authbridge-api" });
});

app.post("/api/v1/authorize", async (req, res) => {
  const orchestrator = new TransactionOrchestrator(
    new IdentityService(),
    new AuthenticationService(),
    new PolicyEngine(),
    new ConsentService(),
  );

  const decision = await orchestrator.authorize(req.body);
  res.status(200).json(decision);
});

app.listen(8080, () => {
  console.log("BioPOS AuthBridge API running on port 8080");
});
