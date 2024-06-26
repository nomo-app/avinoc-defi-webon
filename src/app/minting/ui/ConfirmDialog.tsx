
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import { useTranslation } from "react-i18next";
import CheckIcon from "@mui/icons-material/Check";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { getApyValues } from "../logic/staking-rewards";
import { formatAVINOCAmount } from "@/util/use-avinoc-price";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export const ConfirmDialogSlide: React.FC<{
  isOpen: boolean;
  years: bigint;
  selectedAmount: bigint;
  networkBonus: boolean;
  network: string;
  handleClose: () => void;
  handleConfirm: () => void;
}> = (props) => {
  const { t } = useTranslation();

  function getYearText(): string {
    if (props.years === 1n) {
      return t("staking.year");
    } else {
      return t("staking.years");
    }
  }

  const visibleSelectedAmount = formatAVINOCAmount({
    tokenAmount: props.selectedAmount,
  });

  return (
    <Dialog
      open={props.isOpen}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.handleClose}
      aria-describedby="alert-dialog-slide-description"
      maxWidth="sm"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          backgroundColor: '#283255',
        }
      }}
    // color="white"
    >
      <div
        style={{
          textAlign: "start",
          color: "white",
        }}
      >
        <DialogTitle style={{ textAlign: "center", fontSize: "1.5rem" }}>
          {t("staking.dialogConfirm")}

        </DialogTitle>
        <DialogContent>
          <div style={{
            fontFamily: "Helvetica",
            display: "flex",
            color: "#2FAAA5",
            justifyContent: "start",
          }}>
            {t("staking.amount")}
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              paddingTop: ".5rem",
              justifyContent: "start",
              fontWeight: "bold",
              fontFamily: "Helvetica",
              fontSize: "large",
            }}
            id="alert-dialog-slide-description"
          >
            {visibleSelectedAmount} {props.network}

          </div>

          <div
            style={{
              paddingTop: "1.5rem",
              justifyContent: "start",
              color: "#2FAAA5",
              fontFamily: "Helvetica",
            }}
          >
            {t("reward.stakingPeriod")}
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              paddingTop: ".5rem",
              justifyContent: "start",
              fontFamily: "Helvetica",
              fontWeight: "bold",
              fontSize: "large",
            }}
            id="alert-dialog-slide-description"
          >
            {props.years.toString()}{" "}
            {getYearText()}
          </div>

          <div
            style={{
              paddingTop: "1.5rem",
              display: "flex",
              fontFamily: "Helvetica",
              color: "#2FAAA5",
            }}
            id="alert-dialog-slide-description"
          >
            APY
          </div>
          <div
            style={{
              alignItems: "center",
              display: "flex",
              paddingTop: ".5rem",
              justifyContent: "start",
              fontFamily: "Helvetica",
              fontWeight: "bold",
              fontSize: "large",
            }}
            id="alert-dialog-slide-description"
          >
            {getApyValues(props.years).apyWithoutBonus * 100} %
          </div>

          <div
            style={{
              fontSize: "small",
              marginBottom: "5px",
              display: "flex",
            }}
            id="alert-dialog-slide-description"
          >
            {/* <CheckBoxNetwork networkBonus={props.networkBonus} /> */}
            {/* <div style={{ flexGrow: 1, textAlign: "left", marginRight: "2px" }}>
              {t("staking.apyWithBonus")}:{" "}
            </div> */}
            {/* <div>{getApyValues(props.years).apyWithBonus * 100} %</div> */}
          </div>
        </DialogContent>
        {/* <div>
          <AlertDialog networkBonus={props.networkBonus} />
        </div> */}

        <DialogActions>
          <Button
            style={{
              padding: "2%",
              backgroundColor: "#252837",
              color: "white",
              border: "none",
              borderRadius: "5px",
              width: "100%",
              height: "50px",
              alignSelf: "center",
              margin: ".5rem",
              fontSize: "small",
              fontWeight: "bold",
              transition: "ease-in-out all 0.3s",
            }}
            onClick={props.handleClose}
          >
            {"Cancel"}
          </Button>
          <Button
            style={{
              padding: "2%",
              backgroundColor: "#2FAAA5",
              color: "white",
              border: "none",
              borderRadius: "5px",
              width: "100%",
              height: "50px",
              alignSelf: "center",
              margin: ".5rem",
              fontSize: "small",
              fontWeight: "bold",
              transition: "ease-in-out all 0.3s",
            }}
            onClick={props.handleConfirm}
          >
            {"Stake"}
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
};

const AlertDialog: React.FC<{ networkBonus: boolean }> = (props) => {
  const { t } = useTranslation();

  if (props.networkBonus) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <CheckIcon
          style={{ color: "var(--color-primary-button-background)" }}
        />
        <div
          style={{
            fontSize: "small",
            color: "var(--color-primary-button-background)",
          }}
        >
          {t("staking.networkBonusEnabled")}
        </div>
      </div>
    );
  } else {
    return (
      <div
        style={{
          backgroundColor: "var(--color-warning)",
          padding: "12px",
          fontSize: "small",
          fontWeight: "bold",
        }}
      >
        {t("staking.networkBonusWarning")}
      </div>
    );
  }
};

const CheckBoxNetwork: React.FC<{ networkBonus: boolean }> = (props) => {
  if (props.networkBonus) {
    return <CheckBoxIcon style={{ height: "15px" }} />;
  } else {
    return (
      <CheckBoxOutlineBlankIcon sx={{ height: "15px", colorScheme: "black" }} />
    );
  }
};
