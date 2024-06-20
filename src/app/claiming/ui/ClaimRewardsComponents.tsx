import React from "react";
import "@/common/colors.css";
import {
  formatAVINOCAmount,
  formatTokenDollarPrice,
} from "@/util/use-avinoc-price";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  IconButtonProps,
  LinearProgress,
  LinearProgressProps,
  Typography,
  styled,
} from "@mui/material";
import {
  computeUnclaimedRewards,
  isFullyClaimed,
  StakingNft,
} from "@/web3/web3-minting";
import { usePeriodReRender } from "../../../util/util";
import { PageState } from "@/app/minting/logic/MintingPage";
import { isPendingState } from "@/app/claiming/logic/ClaimRewardsPage";
import { avinocIcon, boxLogo, doubleBoxLogo, rocketIcon } from "@/asset-paths";
import BackButton from "@/common/BackButton";
import { dots, listItem, listTitle } from "./claim-style";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Check } from "@mui/icons-material";


// export const TitleBox: React.FC<{ showBackButton: boolean }> = (props) => {
//   const { t } = useTranslation();
//   return (
//     <div
//       style={{
//         display: "flex",
//         flexDirection: "row",
//         alignItems: "center",
//         fontSize: "large",
//         fontWeight: "bold",
//       }}
//     >
//       {props.showBackButton && <BackButton />}
//       {t("reward.claimRewards")}
//     </div>
//   );
// };

interface ExpandMoreProps extends IconButtonProps {
  expand: boolean;
}

const ExpandMore = styled((props: ExpandMoreProps) => {
  const { expand, ...other } = props;
  return <IconButton {...other} size="small" />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
  color: 'white',
}));

export const ClaimedRewards: React.FC<{
  stakingNFTs: Record<number, StakingNft>;
}> = (props) => {
  const { t } = useTranslation();
  const nftArray: Array<StakingNft> = Object.values(props.stakingNFTs);
  const sumRewards = nftArray.reduce(
    (prev, nft) => prev + nft.claimedRewards,
    0n
  );
  const sumRewardsFormatted = formatAVINOCAmount({ tokenAmount: sumRewards });
  return (
    <Card
      style={{
        width: "90%",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignContent: "center",
        height: "fit-content",
        margin: "0.5rem",
      }}
    >
      <img
        src={rocketIcon}
        style={{ padding: "8px", height: "14px", alignSelf: "center" }}
      />
      <div
        style={{
          marginTop: "5px",
          marginBottom: "5px",
          fontWeight: "Bold",
          fontSize: "14px",
          textAlign: "left",
          flex: "2",
        }}
      >
        <p>{t("reward.claimedRewards")}</p>
      </div>
      <div
        style={{
          alignSelf: "center",
          fontSize: "14px",
          textAlign: "right",
          flex: "1",
        }}
      >
        <p>{sumRewardsFormatted}</p>
      </div>
      <img
        src={avinocIcon}
        className={"avi-logo"}
        style={{ padding: "8px", height: "14px", alignSelf: "center" }}
      />
    </Card>
  );
};

export const ClaimAllButton: React.FC<{
  disabled: boolean;
  onClick: () => void;
}> = (props) => {
  const { t } = useTranslation();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyItems: "center",
        width: "100%",
      }}
    >
      <img
        src={doubleBoxLogo}
        style={{
          height: "65px",
        }}
      />
      <Button
        disabled={props.disabled}
        onClick={() => props.disabled || props.onClick()}
        className={"primary-button"}
        id={"claimButton"}
        style={{
          height: "30px",
          minWidth: "25%",
          marginBottom: "5px",
          maxWidth: "45%",
          backgroundColor: props.disabled
            ? "gray"
            : "var(--color-primary-button-background)",
          color: props.disabled ? undefined : "white",
        }}
      >
        {t("reward.claimAll")}
      </Button>
    </div>
  );
};

export const StakingNftBox: React.FC<{
  avinocPrice: number | null;
  stakingNft: StakingNft;
  pageState: PageState;
  onClickClaim: (stakingNft: StakingNft) => void;
}> = (props) => {
  const { t } = useTranslation();
  usePeriodReRender(1000); // frequent re-rendering to show "live updates" of rewards

  const totalRewards: bigint =
    (props.stakingNft.amount * props.stakingNft.payoutFactor) / 10n ** 18n;
  const unclaimedRewards: bigint = computeUnclaimedRewards(props.stakingNft);
  const unclaimedRewardsFormatted = formatAVINOCAmount({
    tokenAmount: unclaimedRewards,
    ultraPrecision: true, // ultraPrecision to see every second that the rewards are increasing
  });

  const progress: number = Number(
    (100n * (props.stakingNft.claimedRewards + unclaimedRewards)) / totalRewards
  );
  const stakingPeriod: string = `${props.stakingNft.start.toLocaleDateString()} - ${props.stakingNft.end.toLocaleDateString()}`;
  const years: bigint = BigInt(
    props.stakingNft.end.getFullYear() - props.stakingNft.start.getFullYear()
  );
  const avinocPerDay: bigint = totalRewards / (years * 365n);
  const avinocPerDayFormatted = formatAVINOCAmount({
    tokenAmount: avinocPerDay,
  });
  const fullyClaimed: boolean = isFullyClaimed(props.stakingNft);
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  function onClickClaimClosure() {
    props.onClickClaim(props.stakingNft);
  }
  return (
    <Card
      style={{
        padding: "1rem",
        height: "fit-content",
        width: "100%",
        flexShrink: 0,
        marginBottom: "2rem",
        backgroundColor: "#283255",
        borderRadius: "10px",
      }}
    >
      <div style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}>
        <div style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          // justifyContent: "space-between",
        }}>
          <div style={listTitle}>
            NFT-ID
          </div>
          <div style={dots}></div>
          <div style={listItem}>
            {"#" + props.stakingNft.tokenId}
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
          <div style={listTitle}>
            Staked
          </div>
          <div style={dots}></div>
          <div style={listItem}>
            {formatAVINOCAmount({ tokenAmount: props.stakingNft.amount })}
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
          <div style={listTitle}>
            {t("reward.totalPayout")}
          </div>
          <div style={dots}></div>
          <div style={listItem}>
            {formatAVINOCAmount({ tokenAmount: totalRewards })}
          </div>
        </div>
        <div style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
        }}>
          <div style={listTitle}>
            APY
          </div>
          <div style={dots}></div>
          <div style={listItem}>
            {props.stakingNft.apy + "%"}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-evenly",
          rowGap: "10px",
          alignItems: "center",
          width: "100%",
          // marginLeft: "1%",
        }}
      >
        <div
          style={{
            alignSelf: "flex-start",
            width: "100%",
            color: "white",
            paddingBottom: "0.5rem",
          }}
        >
          <LinearProgressWithLabel
            value={progress}
            sx={{
              backgroundColor: "#323F6B",
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#2FAAA5",
              },
            }}
          />
        </div>

        {/*row - unclaimed rewards and claim-button */}

      </div>
      {fullyClaimed ? (
        <div style={{
          paddingTop: ".5rem",
          display: "flex",
          alignItems: "center",
          width: "100%", fontSize: "1rem", color: "#D2D2D2"
        }}>
          <Check style={{ color: "#2FAAA5", marginRight: ".5rem", marginBottom: ".2rem" }} />
          Fully claimed
        </div>
      ) : (
        <CardActions style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0 0rem",
          width: "100%",
        }}>
          <div
            style={{
              fontSize: "1.1rem",
              color: "#2FAAA5",
            }}
          >
            {t("reward.unclaimedRewards")}
          </div>
          <div style={{ marginRight: '-12px' }}>
            <ExpandMore
              expand={expanded}
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              style={{ color: 'white' }}
            >

              <ExpandMoreIcon fontSize="large" />
            </ExpandMore>
          </div>
        </CardActions>
      )
      }
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent style={{ padding: "0rem" }}>
          <div style={
            {
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "start",
              width: "100%",
            }

          }>
            <div style={{ fontSize: "normal", fontWeight: "bold", color: "white", paddingBottom: ".5rem" }}>{unclaimedRewardsFormatted} </div>
            <div style={{ fontSize: "normal", fontWeight: "bold", color: "#D2D2D2" }}>
              {formatTokenDollarPrice({
                tokenPrice: props.avinocPrice,
                tokenAmount: unclaimedRewards,
              })}
            </div>
            <ClaimButton
              disabled={fullyClaimed ?? isPendingState(props.pageState as any)}
              fullyClaimed={fullyClaimed}
              onClick={onClickClaimClosure}
            />
          </div>
        </CardContent>
      </Collapse>
    </Card>
  );
};

export const ClaimButton: React.FC<{
  disabled: boolean;
  fullyClaimed: boolean;
  onClick: () => void;
}> = (props) => {
  const { t } = useTranslation();
  return (
    <Button
      disabled={props.disabled}
      onClick={() => props.disabled || props.onClick()}
      className={"primary-button"}
      id={"claimButton"}
      style={{
        marginTop: "10px",
        marginRight: "5px",
        height: "30px",
        width: "100%",
        fontWeight: "bold",
        fontSize: "large",
        borderRadius: "5px",
        backgroundColor: props.disabled
          ? "gray"
          : "#2FAAA5",
        color: props.disabled ? undefined : "white",
      }}
    >
      {props.fullyClaimed ? t("reward.fullyClaimed") : t("reward.claim")}
    </Button>
  );
};

const LinearProgressWithLabel: React.FC<
  LinearProgressProps & { value: number }
> = (props) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', width: '100%', marginTop: ".5rem" }}>
      <LinearProgress
        style={{ height: '2rem', borderRadius: '6px', width: '100%' }}
        variant="determinate"
        {...props}
      />
      <Box
        sx={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
        }}
      >
        {`${props.value.toFixed(2)}%`}
      </Box>
    </Box>
  );
};