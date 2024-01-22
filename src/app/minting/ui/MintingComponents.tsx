import {
  Alert,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
} from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { UnreachableCaseError } from "@/util/typesafe";

import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { avinocIcon, stakingIcon } from "@/asset-paths";
import { PageState } from "../logic/MintingPage";
import BackButton from "@/common/BackButton";
import { getTokenStandard, navigateToClaimingPage } from "@/web3/navigation";
import { formatAVINOCAmount } from "@/util/use-avinoc-price";
import { useNavigate } from "react-router-dom";
import "./MintingComponents.scss";

export function isErrorState(pageState: PageState) {
  return pageState.startsWith("ERROR");
}

export const StatusBox: React.FC<{ pageState: PageState }> = (props) => {
  const { t } = useTranslation();

  if (props.pageState === "IDLE") {
    return <div />;
  }

  function getStatusMessage() {
    switch (props.pageState) {
      case "ERROR_INSUFFICIENT_ETH":
      case "ERROR_INSUFFICIENT_AVINOC":
      case "ERROR_FETCH_FAILED":
      case "ERROR_MISSING_WALLET_BACKUP":
      case "ERROR_TX_FAILED":
      case "ERROR_INSUFFICIENT_RESERVES":
      case "ERROR_LIMIT_EXCEEDED":
      case "PENDING_SUBMIT_TX":
        return t("status." + props.pageState);
      case "IDLE":
        return ""; // should never happen
      default:
        throw new UnreachableCaseError(props.pageState);
    }
  }

  if (isErrorState(props.pageState)) {
    return (
      <div style={{ margin: "10px" }}>
        <Alert severity={"error"}>{getStatusMessage()}</Alert>
      </div>
    );
  } else {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          marginBottom: "5px",
          marginTop: "10px",
        }}
      >
        <CircularProgress />
        <div
          style={{
            fontWeight: "bold",
            marginLeft: "5px",
            display: "flex",
            alignItems: "center",
          }}
        >
          {getStatusMessage()}
        </div>
      </div>
    );
  }
};

export const StakeButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
}> = (props) => {
  return (
    <button
      className="minting-page-button"
      disabled={props.disabled}
      onClick={() => props.disabled || props.onClick()}
      style={{
        color: props.disabled ? "white" : undefined,
        backgroundColor: props.disabled ? "grey" : "var(--color-primary-button-background)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          fontSize: "large",
        }}
      >
        {"Stake " + getTokenStandard()}
      </div>
    </button>
  );
};

export const SwitchToRewardPageButton: React.FC<{
  disabled: boolean;
}> = (props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function onClick() {
    navigateToClaimingPage(navigate);
  }

  return (
    <button
      className="minting-page-button"
      disabled={props.disabled}
      onClick={() => props.disabled || onClick()}
      style={{
        color: props.disabled ? "grey" : undefined,
        backgroundColor: props.disabled ? "grey" : "var(--color-primary-button-background)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          fontSize: "large",
        }}
      >
      {t("staking.claimRewards")}
      </div>
    </button>
  );
};
export const StakingTitleBar: React.FC = () => {
  const tokenStandard = getTokenStandard();

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <BackButton />
      <div style={{ fontWeight: "bold", fontSize: "large" }}>{"AVINOC " + tokenStandard + " Staking"}</div>
    </div>
  );
};

const INPUT_ERROR_TRHESHOLD = -2n;

export const AvinocAmountInput: React.FC<{
  onChange: (value: bigint) => void;
  value: bigint;
  maxValue: bigint | null;
}> = (props) => {
  const { t } = useTranslation();

  const onChangeWrapper = (event: any) => {
    const rawString: string = event.target.value ?? "";
    console.log("rawString", rawString);
    if (typeof rawString !== "string") {
      return;
    }
    if (rawString === "") {
      props.onChange(INPUT_ERROR_TRHESHOLD);
      return;
    }
    const valueString = rawString.trim();
    const floatValue: number = parseFloat(valueString) * 1e18;
    if (isNaN(floatValue)) {
      return;
    }
    const bigintValue = BigInt(Math.floor(floatValue));
    console.log("bigintValue", bigintValue);

    props.onChange(bigintValue);
  };

  const availableText =
    props.maxValue !== null && props.maxValue !== undefined
      ? `${t("staking.available")}: ${formatAVINOCAmount({
          tokenAmount: props.maxValue,
        })}`
      : t("staking.loadBalance");

  const isError = props.value <= INPUT_ERROR_TRHESHOLD;

  const userVisibleProp = props.value >= 0 ? Number(props.value) / 1e18 : "";

  return (
    <TextField
      id="textfield_outline"
      helperText={availableText}
      label={t("staking.amountStaking")}
      variant="outlined"
      type={"number"}
      style={{
        width: "90%",
        marginLeft: "1rem",
        marginRight: "1rem",
        marginTop: "2rem",
      }}
      sx={{
        input: { color: "white" },
        label: { color: "white" },
        "& .MuiOutlinedInput-root": {
          "& fieldset": {
            borderColor: "white",
          },
          "&:hover fieldset": {
            borderColor: "white",
          },
          "&.Mui-focused fieldset": {
            borderColor: "white",
          },
        },
        "& .MuiFormHelperText-root": {
          color: "white",
          fontSize: "medium",
          textAlign: "center",
          marginTop: "2rem",
        },
        "& .MuiInput-underline:before": {
          // underline color when textfield is not focused
          borderBottomColor: "white",
        },
        "& .MuiInput-underline:after": {
          // underline color when textfield is focused
          borderBottomColor: "white",
        },
      }}
      error={isError}
      value={userVisibleProp}
      onChange={onChangeWrapper}
      inputProps={{
        inputMode: "decimal",
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment onClick={() => !props.maxValue || props.onChange(props.maxValue)} position="end">
            <div id={"max_button"} className={"MaxButton"}>
              MAX
            </div>
          </InputAdornment>
        ),
        startAdornment: (
          <InputAdornment position="start">
            <img src={avinocIcon} className="Zeniq-Logo" alt="logo" style={{ width: 25, height: 25 }} />
          </InputAdornment>
        ),
      }}
    />
  );
};
export const SelectYears: React.FC<{
  years: bigint;
  onChange: (e: SelectChangeEvent) => void;
}> = (props) => {
  const { t } = useTranslation();

  return (
    <FormControl variant={"outlined"} sx={{ m: 1 }} style={{ width: "90%", marginTop: "2rem", marginBottom: "2rem" }}>
      <InputLabel
        id="stakingTimeTitle"
        sx={{ color: "white", "&::before": { borderBottomColor: "white" }, "&::after": { borderBottomColor: "white" } }}
      >
        {t("reward.stakingPeriod")}
      </InputLabel>
      <Select
        label="Staking Time"
        value={"" + props.years}
        onChange={props.onChange}
        style={{ fontWeight: "bold" }}
        sx={{
          color: "white",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "white",
          },
          "& .MuiSvgIcon-root": {
            // Directly targeting the SVG icon
            fill: "white!important",
          },
        }}
      >
        <MenuItem value={1}>{"1 " + t("staking.year")}</MenuItem>
        <MenuItem value={3}>{"3 " + t("staking.years")}</MenuItem>
        <MenuItem value={5}>{"5 " + t("staking.years")}</MenuItem>
        <MenuItem value={10}>{"10 " + t("staking.years")}</MenuItem>
        {/*<MenuItem value={15}>{"15 " + t("staking.years")}</MenuItem>*/}
      </Select>
    </FormControl>
  );
};
export const AvinocYearsLabel: React.FC<{ label: string }> = (props) => {
  return (
    <div
      className={"Col"}
      style={{
        fontWeight: "bold",
        fontSize: "medium",
      }}
    >
      {props.label}
    </div>
  );
};
export const AvinocRewardLabel: React.FC<{ label: string }> = (props) => {
  return (
    <div
      className={"Reward"}
      id={"reward_15"}
      style={{
        fontWeight: "light",
        fontSize: "medium",
        color: "white",
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {props.label}
      {/* <img src={avinocIcon} className={"avi-logo"}  /> */}
    </div>
  );
};

export const AvinocDollarRewardLabel: React.FC<{ label: string }> = (props) => {
  return (
    <div
      style={{
        fontWeight: "light",
        fontSize: "medium",
        color: "white",
      }}
    >
      {props.label}
    </div>
  );
};

export const BonusBox: React.FC<{ apyLabel: string; networkBonus: boolean }> = (props) => {
  const { t } = useTranslation();

  if (props.networkBonus) {
    return (
      <div
        className="bonus-box"
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          minHeight: "1rem",
          fontWeight: "bold",
          color: "white",
          fontSize: "medium",
          background: "linear-gradient(45deg, blue, lightblue)",
          borderRadius: ".5rem",
          padding: ".5rem",
        }}
      >
        <div>{t("staking.networkBonus") + ": " + props.apyLabel}</div>
      </div>
    );
  } else {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          minHeight: "1rem",
          fontWeight: "bold",
          color: "black",
          fontSize: "medium",
          background: "var(--color-warning)",
          borderRadius: ".25rem",
        }}
      >
        <div>{t("staking.networkBonus") + ": " + props.apyLabel}</div>
      </div>
    );
  }
};
