
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import { TransitionProps } from "@mui/material/transitions";
import animationClaimed from "../../../lotties/claimed.json";
import { useTranslation } from "react-i18next";
import { Lottie } from "@/lottie/Lottie";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const confettiOptions = {
  loop: true,
  autoplay: true,
  animationData: animationClaimed,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};

export const CongratDialogSlide: React.FC<{
  isOpen: boolean;
  handleClose: () => void;
  translationKey: string;
}> = (props) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={props.isOpen}
      TransitionComponent={Transition}
      keepMounted
      onClose={props.handleClose}
      aria-describedby="alert-dialog-slide-description"
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          backgroundColor: '#283255',
        }
      }}
    >
      <DialogTitle sx={{ textAlign: "center", color: "white", backgroundColor: "#283255" }} >
        {t("dialog.congratulations")}
      </DialogTitle>
      <DialogContent sx={{ backgroundColor: "#283255", color: "white" }}>
        <DialogContentText
          style={{ zIndex: "1", textAlign: "center", color: "white" }}
          id="alert-dialog-slide-description"
        >
          {t(props.translationKey)}
        </DialogContentText>
        <Lottie config={confettiOptions} />
      </DialogContent>
      <DialogActions sx={{ backgroundColor: "#283255" }}>
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
            margin: "20px",
            fontSize: "small",
            fontWeight: "bold",
            transition: "ease-in-out all 0.3s",
          }}
          onClick={props.handleClose}
        >
          {t("dialog.great")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
