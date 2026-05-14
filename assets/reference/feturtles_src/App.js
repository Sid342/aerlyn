import React from "react";
import StepperComponent from "./StepperComponent";
import { Container } from "@mui/material";

const App = () => {
  return (
    // <Container>
    <div>
      <StepperComponent />
      <div style={{ position: "absolute", bottom: "1rem", right: "1rem" }}>
        v1.0.0
      </div>
    </div>
    // </Container>
  );
};

export default App;
