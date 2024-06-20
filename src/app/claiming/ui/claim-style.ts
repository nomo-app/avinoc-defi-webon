import { CSSProperties } from "react";
import "./ClaimRewardsComponents.css";
import exp from "constants";

export const claimRewardsMainFlexBox: CSSProperties = {
  /* The css variables that are prefixed with "nomo" adjust themselves according to the current Nomo theme */
  // background: "linear-gradient(to bottom right, white, var(--nomoBackground))",
  display: "flex",
  flexDirection: "column",
  rowGap: "10px",
  alignContent: "start",
  textAlign: "center",
  justifyContent: "center",
  fontFamily: "helvetica",
  height: "100vh",
  width: "100%",
  backgroundColor: "#1D2140",
};

export const claimRewardTitle: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  color: "white",
  fontWeight: "bold",
  fontSize: "1.4rem",
  marginTop: "1rem",
  marginLeft: "1rem",
};

export const listTitle: CSSProperties = {
  color: "#D2D2D2",
  fontSize: "normal",
  marginBottom: "0.5rem",
};

export const listItem: CSSProperties = {
  color: "white",
  fontSize: "normal",
  fontWeight: "bold",
  marginBottom: "0.5rem",
};

export const dots: CSSProperties = {
  flexGrow: "1",
  borderBottom: "2px dotted #525971",
  marginLeft: "1rem",
  marginRight: "1rem",
  alignSelf: "center",
  marginBottom: "0.5rem",
};