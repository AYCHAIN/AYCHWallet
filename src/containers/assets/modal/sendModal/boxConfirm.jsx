import React from "react";
import PropTypes from "prop-types";

// REDUX
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { setAddressModalStep } from "../../redux/assetsAction";
import { errorInput } from "../../../errors/redux/errorAction";

// UTILS
import { encryptHmacSha512Key } from "../../../../utils/cryptography";
import i18n from "../../../../utils/i18n";

// COMPONENTS
import ButtonContinue from "./buttonContinue.jsx";

// STYLE
import style from "../../style.css";

class BoxConfirm extends React.Component {
  constructor() {
    super();
    this.state = {
      password: ""
    };
  }

  setPassword = password => {
    this.setState({ ...this.state, password });
  };

  confirmPassword = () => {
    let { password } = this.state;
    let { user, errorInput, setAddressModalStep } = this.props;

    if (user.password === encryptHmacSha512Key(password)) {
      setAddressModalStep(4);
      return;
    }
    errorInput(i18n.t("MESSAGE_INVALID_PASSWORD"));
    return;
  };

  render() {
    let { password } = this.state;
    let { coin, modal,assets } = this.props;
    let { selectedCoin } = assets;
    let amount = (modal.sendAmount).toFixed(8);
    return (
      <div className={style.modalBox}>
        <img
          src="/images/icons/privacy/privacy.png"
          className={style.modalIconCoin}
        />
        <div>
          <span>{i18n.t("MODAL_SEND_INFO_TRANSACTION")} </span>
          <span className={style.totalConfirm}>
            {amount + " " + assets.assets[selectedCoin].tokenName.toUpperCase()}
          </span>
          <span> {i18n.t("MODAL_SEND_TO_ADDRESS")} </span>
          <span className={style.addressConfirm}>{modal.address}</span>
        </div>

        <div className={style.confirmFee}>
          <input
            type="password"
            name="txtpass"
            placeholder="*********"
            onChange={event => this.setPassword(event.target.value)}
            value={password}
            className={style.inputTextDefault}
          />
        </div>

        <ButtonContinue
          action={() => this.confirmPassword()}
          loading={modal.loading}
        />
      </div>
    );
  }
}

BoxConfirm.propTypes = {
  assets: PropTypes.object.isRequired,
  coin: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  modal: PropTypes.object.isRequired,
  errorInput: PropTypes.func.isRequired,
  setAddressModalStep: PropTypes.func.isRequired
};

const mapSateToProps = store => ({
  modal: store.assets.modal,
  user: store.user.user,
  assets: store.assets,
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setAddressModalStep,
      errorInput
    },
    dispatch
  );

export default connect(
  mapSateToProps,
  mapDispatchToProps
)(BoxConfirm);