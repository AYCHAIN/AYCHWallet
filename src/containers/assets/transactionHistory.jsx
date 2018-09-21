import React from "react";
import PropTypes from "prop-types";

// REDUX
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  setAssetLoading,
  getAssetHistory,
  getAssetGeneralInfo,
  reloadAsset
} from "./redux/assetsAction";
import { loadWalletInfo } from "../skeleton/redux/skeletonAction";

// STYLE
import style from "./style.css";

// MATERIAL UI
import Grid from "@material-ui/core/Grid";

// COMPONENTS
import Loading from "../../components/loading";

// UTILS
import i18n from "../../utils/i18n";
import { getAssetInfo } from "../../utils/assets";
// import { getDefaultFiat, getDefaultCrypto } from "../../utils/localStorage";
import { formatDate } from "../../utils/numbers";
import { convertBiggestCoinUnit } from "../../utils/numbers";

const blockexplorer = {
  lunes: "https://blockexplorer.lunes.io/tx/",
  btc: "https://live.blockcypher.com/btc/tx/"
};

class TransactionHistory extends React.Component {
  constructor() {
    super();
    this.state = {
      toggleHistory: undefined
    };
  }

  componentDidMount() {}

  stateDataHistory = key => {
    let { toggleHistory } = this.state;
    this.setState({
      toggleHistory: toggleHistory === key ? undefined : key
    });
  };

  reloadWallet = () => {
    let { skeleton, assets, reloadAsset } = this.props;
    let { selectedCoin } = assets;
    let address = skeleton.coins.lunes.address;
    reloadAsset(selectedCoin, address)
  };

  renderHistory = () => {
    let { toggleHistory } = this.state;
    let { assets: assetsRoute, skeleton } = this.props;
    let { assets, selectedCoin, history } = assetsRoute;

    let currentAsset = assets.find(asset => asset.assetId === selectedCoin ? true : false)

    if (!currentAsset) return null;

    currentAsset = {
      ...currentAsset,
      ...getAssetInfo(selectedCoin)
    }

    if (!history.assets || history.assets.length < 1) {
      return (
        <div className={style.notFound}>{i18n.t("MESSAGE_NOTHING_FOUND")}</div>
      );
    }

    let lunesAddress = skeleton.coins.lunes.address;

    return history.assets.map((val, index) => {
      let transaction = history.assets[index];
      let type = lunesAddress === transaction.toAddress ? "SENT" : "RECEIVED";
      let decimalPoint = 8;
      return (
        <div key={index}>
          <div>
            <Grid
              item
              xs={12}
              className={
                toggleHistory !== undefined && toggleHistory !== index
                  ? style.opacityItem
                  : style.itemHistorico
              }
              onClick={() => this.stateDataHistory(index)}
            >
              <Grid item xs={3} sm={2} className={style.typeItems}>
                <div>
                  <img
                    src={
                      "./images/wallet/" +
                      type.toLowerCase() +
                      ".png"
                    }
                  />
                </div>
                <div className={style.dateHistory}>
                  {formatDate(transaction.date, "DM")}
                </div>
              </Grid>
              <Grid item xs={6} className={style.descriptionHistory}>
                {transaction.describe}
              </Grid>
              <Grid item xs={4} className={style.valueHistory}>
                <div
                  className={
                    type === "RECEIVED"
                      ? style.receivedHistory
                      : style.sentHistory
                  }
                >
                  {type === "RECEIVED" || "-"}
                  {convertBiggestCoinUnit(
                    transaction.amount,
                    decimalPoint
                  ).toFixed(decimalPoint)}{" "}
                </div>
              </Grid>
            </Grid>

            <div>
              <Grid
                item
                xs={12}
                className={toggleHistory !== index ? style.toggleHistory : null}
              >
                <Grid item xs={12} className={style.itemDataHistorico}>
                  <Grid item xs={2}>
                    {" "}
                  </Grid>
                  <Grid item xs={6} sm={7}>
                    <div className={style.titleBlockExplorer}>
                      {i18n.t("TEXT_BLOCKEXPLORER")}
                    </div>
                  </Grid>
                  <Grid
                    item
                    xs={4}
                    sm={3}
                    className={style.alignTimeInValueHistory}
                  >
                    <div className={style.timeInValueHistory}>
                      {formatDate(transaction.date, "HMS")}
                    </div>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Grid item xs={12} className={style.itemDataHistorico}>
                    <Grid item xs={2} className={style.typeItems}>
                      <div> {i18n.t("TEXT_ID")} </div>
                    </Grid>
                    <Grid item xs={10} className={style.descriptionHistory}>
                      <a
                        className={style.idTransactionHistory}
                        target="blanck"
                        href={
                          blockexplorer[selectedCoin]
                            ? blockexplorer[selectedCoin] + transaction.txID
                            : ""
                        }
                      >
                        {transaction.txID.substring(0, 33) + "..." || "-"}
                      </a>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} className={style.itemDataHistorico}>
                    <Grid item xs={2} className={style.typeItems}>
                      <div className={style.fromTransactionHistory}>
                        {i18n.t("TEXT_FROM")}
                      </div>
                    </Grid>
                    <Grid item xs={10} className={style.descriptionHistory}>
                      <div className={style.fromTransactionHistory}>
                        {transaction.from || "-"}
                      </div>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} className={style.itemDataHistorico}>
                    <Grid item xs={2} className={style.typeItems}>
                      <div className={style.forTransactionHistory}>
                        {i18n.t("TEXT_TO")}
                      </div>
                    </Grid>
                    <Grid item xs={10} className={style.descriptionHistory}>
                      <div className={style.forTransactionHistory}>
                        {transaction.to || "-"}
                      </div>
                    </Grid>
                  </Grid>

                  {transaction.promoCode ? (
                    <Grid item xs={12} className={style.itemDataHistorico}>
                      <Grid item xs={2} className={style.typeItems}>
                        <div className={style.forTransactionHistory}>
                          {i18n.t("TEXT_PROMOTIONAL")}
                        </div>
                      </Grid>
                      <Grid item xs={10} className={style.descriptionHistory}>
                        <div className={style.forTransactionHistory}>
                          {transaction.promoCode}
                        </div>
                      </Grid>
                    </Grid>
                  ) : null}
                </Grid>
              </Grid>
            </div>
          </div>
        </div>
      );
    });
  };

  render() {
    let { isTxHistoryLoading } = this.props.assets;
    let { selectedCoin } = this.props.assets;

    if (selectedCoin === 'lunes' || !selectedCoin)
      return null;

    return (
      <div>
        <Grid className={style.containerTransactions}>
          <Grid item xs={11} sm={7} md={6}>
            <div className={style.alignItemsHeaderHistory}>
              <div
                className={style.refleshIcon}
                onClick={() => this.reloadWallet()}
              >
                <img
                  width="15px"
                  height="15px"
                  src="images/icons/general/refresh@2x.png"
                />
              </div>
              <div className={style.historyTitle}>
                {i18n.t("TRANSACTION_HISTORY_TITLE")}
              </div>
            </div>
            <div className={style.contentTransactions}>
              {isTxHistoryLoading ? (
                <Loading margin={"5% 0 0 0"} color="lunes" />
              ) : (
                this.renderHistory()
              )}
            </div>
          </Grid>
        </Grid>
      </div>
    );
  }
}

TransactionHistory.propTypes = {
  user: PropTypes.object.isRequired,
  wallet: PropTypes.object.isRequired,
  coins: PropTypes.array.isRequired,
  skeleton: PropTypes.object.isRequired,
  loadWalletInfo: PropTypes.func.isRequired,
  setAssetLoading: PropTypes.func.isRequired,
  getAssetHistory: PropTypes.func.isRequired,
  assets: PropTypes.object.isRequired,
  getAssetGeneralInfo: PropTypes.func.isRequired,
  reloadAsset: PropTypes.func.isRequired
};

const mapSateToProps = store => ({
  user: store.user.user,
  wallet: store.wallet,
  coins: store.skeleton.coins,
  skeleton: store.skeleton,
  assets: store.assets,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      loadWalletInfo,
      setAssetLoading,
      getAssetHistory,
      getAssetGeneralInfo,
      reloadAsset
    },
    dispatch
  );

export default connect(
  mapSateToProps,
  mapDispatchToProps
)(TransactionHistory);
