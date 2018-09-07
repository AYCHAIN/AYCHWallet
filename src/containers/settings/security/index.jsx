import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// REDUX
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { getTwoFactorAuth } from "../redux/settingsAction";
import { errorInput } from "../../errors/redux/errorAction";

// STYLE
import style from "../style.css";

// MATERIAL UI
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";

// UTILS
import i18n from "../../../utils/i18n";

// COMPONENTS
import InputSecurity from "./inputSecurity";
import Loading from "../../../components/loading";

class Security extends React.Component {
  componentDidMount() {
    let { getTwoFactorAuth } = this.props;
    getTwoFactorAuth();
  }

  renderTwoFactor = () => {
    let { settings, twoFactor } = this.props;
    if (twoFactor) {
      return <div>Two Factor Authentication already registered!</div>;
    }

    return (
      <div>
        <Grid item xs={3} className={style.item}>
          <Grid className={style.contentItem}>
            <img src={settings.security.urlImage || <Loading />} />
          </Grid>
        </Grid>

        <Grid item xs={3} className={style.item}>
          <Grid className={style.contentItem}>
            <Grid item>
              <InputSecurity />
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  };

  render() {
    return (
      <div>
        <Grid container className={style.containerHeaderSettings}>
          <Grid item xs={12} className={style.headerSettingsDefault}>
            <Hidden smUp>
              <Grid item xs={12}>
                <h3>{i18n.t("SECURITY_TITLE")} </h3>
              </Grid>
            </Hidden>
            <Grid item sm={1} />

            <Grid item xs={6} sm={2}>
              <Link to="settings">
                <p>{i18n.t("SETTING_LINK_RETURN")}</p>
              </Link>
            </Grid>
            <Hidden xsDown>
              <Grid item xs={12} sm={3}>
                <h3>{i18n.t("SECURITY_TITLE")}</h3>
              </Grid>
            </Hidden>

            <Grid item xs={8} sm={6} id={"hr"}>
              <hr />
            </Grid>
          </Grid>
        </Grid>

        <div className={style.containerSecurity}>
          <Grid item xs={11}>
            <Grid container className={style.allSecurity}>
              <Grid item xs={12} className={style.containerItems}>
                <Hidden smUp>
                  <Grid item xs={6} className={style.columItemsMobile}>
                    <img src="images/QRCode.png" />
                  </Grid>
                </Hidden>

                <Grid item xs={6} sm={12} className={style.counterItems}>
                  <Grid item xs={12} sm={3} className={style.columItems}>
                    <Grid className={style.indicatorItem}>
                      {"1"} <p>{i18n.t("SECURITY_ITEM_1")}</p>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sm={3} className={style.columItems}>
                    <Grid className={style.indicatorItem}>
                      {"2"} <p> {i18n.t("SECURITY_ITEM_2")} </p>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={3} className={style.columItems}>
                    <Grid className={style.indicatorItem}>
                      {"3"} <p>{i18n.t("SECURITY_ITEM_3")}</p>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Hidden xsDown>
                <Grid container className={style.containerItemsWeb}>
                  <Grid item xs={3} className={style.item}>
                    <Grid>
                      <Link to="https://itunes.apple.com/br/app/google-authenticator/id388497605?mt=8">
                        <img src="images/apple@1x.png" />
                      </Link>
                      <br />
                      <Link to="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=pt_BR">
                        <img src="images/google-play@1x.png" />
                      </Link>
                    </Grid>
                  </Grid>
                  {this.renderTwoFactor()}
                </Grid>
              </Hidden>

              <Hidden smUp>
                <Grid container className={style.columItemsMobile}>
                  <InputSecurity />
                  <Grid item xs={12} className={style.alignLaunchMobile}>
                    <Link to="#">
                      <img src="images/apple@1x.png" />
                    </Link>
                    <Link to="#">
                      <img src="images/google-play@1x.png" />
                    </Link>
                  </Grid>
                </Grid>
              </Hidden>
            </Grid>
          </Grid>
        </div>
      </div>
    );
  }
}

Security.propTypes = {
  twoFactor: PropTypes.bool,
  loadingSettings: PropTypes.func,
  getTwoFactorAuth: PropTypes.func,
  clearMessage: PropTypes.func,
  errorInput: PropTypes.func,
  settings: PropTypes.object
};

const mapSateToProps = store => ({
  twoFactor: store.user.twoFactor,
  settings: store.settings
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      getTwoFactorAuth,
      errorInput
    },
    dispatch
  );

export default connect(
  mapSateToProps,
  mapDispatchToProps
)(Security);