import React, { StrictMode } from "react";
import PropTypes from "prop-types";

//REDUX
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import {
  setLoading,
  setUserData,
  setModalSteps,
  depositGetStates,
  depositGetCity
} from "../../redux/depositAction";

// STYLE
import style from "./style.css";
import colors from "../../../../components/bases/colors";

// MATERIAL
import {
  Grid,
  Input,
  Select,
  MenuItem,
  Radio,
  FormControlLabel,
  FormControl,
  RadioGroup
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import { Lens } from "@material-ui/icons";

//COMPONENTS
import ButtonContinue from "../../../../components/buttonContinue";
import Loading from "../../../../components/loading";
import { CpfMask, CnpjMask } from "../../../../components/inputMask";

// UTILS
import i18n from "../../../../utils/i18n";

const customStyle = theme => ({
  inputRoot: {
    color: colors.messages.info,
    margin: "0.5rem 0",
    padding: "5px",
    width: "calc(100% - 20px)",
    "&:hover:before": {
      borderBottomColor: colors.purple.dark
    }
  },
  inputCss: {
    color: colors.messages.info,
    fontFamily: "Noto Sans, sans-serif",
    fontSize: "14px",
    letterSpacing: "0.5px",
    textAlign: "left"
  },
  inputCssCenter: {
    fontFamily: "Noto Sans, sans-serif",
    fontSize: "12px",
    letterSpacing: "0.5px",
    textAlign: "left"
  },
  inputCssUnderline: {
    "&:before, &:after": {
      borderBottomColor: colors.purple.dark
    },
    "&:hover:not($disabled):not($error):not($focused):before": {
      borderBottomColor: `${colors.purple.dark} !important`
    }
  },
  inputCssUnderlineDisabled: {
    "&:before, &:after": {
      display: "none"
    }
  },
  disabled: {},
  error: {},
  focused: {},
  underlineItems: {
    color: "white",
    borderBottomColor: `${colors.green.default} !important`,
    fontSize: "1em",
    width: "100%",
    [theme.breakpoints.down("sm")]: {
      width: "15em"
    },
    icon: {
      fill: "green"
    }
  },
  menuItemRoot: {
    color: colors.messages.info
  },
  underline: {
    width: "100%",
    "&:hover": {
      backgroundColor: colors.purple.dark
    },
    "&:before": {
      borderColor: colors.purple.dark
    },
    "&:after": {
      borderColor: colors.purple.dark
    }
  },
  icon: {
    fill: "#68f285"
  },
  checked: {
    color: "#68f285"
  },
  rootRadio: {
    color: "#654fa4",
    "&$checked": {
      color: "#68f285"
    },
    margin: "0px 55px 0 1px"
  },
  rootRadioGroup: {
    padding: "5px 3px 0px 2px"
  },
  rootLabel: {
    fontSize: "11px",
    color: "#fff",
    position: "relative",
    right: "60px",
    top: "2px"
  }
});

class InformationModal extends React.Component {
  constructor() {
    super();
    this.state = {
      fullName: "",
      document: "",
      city: "",
      state: "",
      cep: "",
      address: "",
      addressNumber: "",
      documentType: ""
    };
  }
  componentDidMount() {
    const { depositGetStates } = this.props;
    depositGetStates("BR");
  }
  checkAllInputs = () => {
    const {
      fullName,
      document,
      state,
      city,
      cep,
      address,
      addressNumber
    } = this.state;

    return (
      fullName && document && state && city && cep && address && addressNumber
    );
  };

  handleInput = property => e => {
    let value = null;
    const { depositGetCity } = this.props;
    switch (property) {
      case "fullName":
        value = e.target.value.replace(/[^0-9a-zA-Z-]/, "");
        break;
      case "document":
        if (documentType === "passport") {
          value = value.replace(/[^A-Z0-9]/, "");
          if (value.length < 10) {
            this.setState({
              [property]: value
            });
          }
        } else {
          this.setState({
            [property]: value
          });
        }
        break;
      case "cep":
        value = e.target.value.replace(/[^0-9-]/, "");
        break;
      case "address":
        value = e.target.value.replace(/[^0-9a-zA-Z.-]/, "");
        break;
      case "addressNumbe":
        value = e.target.value.replace(/\D/, "");
        break;
      case "state":
        value = e.target.value;
        depositGetCity({ country: "BR", state: value });
        break;
      default:
        value = e.target.value;
        break;
    }
    this.setState({
      [property]: value
    });
  };

  validateForm = () => {
    const { setLoading, setUserData, setModalSteps } = this.props;

    setLoading(true);
    setModalSteps(2);

    // remove in the future
    window.setTimeout(() => setUserData(this.state), 3000);
  };
  handleRadioChange = event => {
    this.setState({ documentType: event.target.value, document: "" });
  };
  listStates = () => {
    const { classes, states } = this.props;
    if (states) {
      return states.map((item, index) => (
        <MenuItem
          value={item}
          key={index}
          classes={{
            root: classes.menuItemRoot
          }}
        >
          {item}
        </MenuItem>
      ));
    }
    return "";
  };
  listCities = () => {
    const { classes, city } = this.props;
    if (city) {
      return city.map((item, index) => (
        <MenuItem
          value={item}
          key={index}
          classes={{
            root: classes.menuItemRoot
          }}
        >
          {item}
        </MenuItem>
      ));
    }
    return "";
  };

  render() {
    const { classes, loading } = this.props;
    const { documentType } = this.state;
    const MenuProps = {
      PaperProps: {
        style: {
          color: "#fff",
          maxHeight: 40 * 4.5,
          marginTop: "45px",
          backgroundColor: "#473088",
          width: "10%"
        }
      }
    };
    let inputMask = null;
    if (documentType === "cnpj") {
      inputMask = CnpjMask;
    } else if (documentType === "cpf") {
      inputMask = CpfMask;
    }
    return (
      <div>
        <Grid container className={style.container}>
          <Grid item xs={12}>
            <p className={style.formGroup}>
              {i18n.t("DEPOSIT_INF_MODAL_TITLE")}
            </p>
          </Grid>
          <Grid container direction="row" className={style.formGroup}>
            <Grid item xs={12} sm={12}>
              <div className={style.textGreen}>
                {i18n.t("DEPOSIT_INF_MODAL_FULLNAME")}
              </div>
              <Input
                classes={{
                  root: classes.inputRoot,
                  underline: classes.inputCssUnderline,
                  input: classes.inputCssCenter
                }}
                placeholder={i18n.t("DEPOSIT_INF_MODAL_FULLNAME")}
                value={this.state.fullName}
                onChange={this.handleInput("fullName")}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <div className={style.textGreen}>
                {i18n.t("SECURITY_INSERT_DOC")}
              </div>
              <Grid item xs={12} sm={12} md={12}>
                <FormControl component="fieldset" className={style.labelRadio}>
                  <RadioGroup
                    aria-label="Documentos"
                    name="documentos"
                    value={documentType}
                    onChange={this.handleRadioChange}
                    row={true}
                    classes={{ root: classes.rootRadioGroup }}
                  >
                    <FormControlLabel
                      value="cpf"
                      control={
                        <Radio
                          icon={<Lens />}
                          checkedIcon={<Lens />}
                          classes={{
                            root: classes.rootRadio,
                            checked: classes.checked
                          }}
                        />
                      }
                      label="CPF"
                      classes={{ label: classes.rootLabel }}
                    />
                    <FormControlLabel
                      value="cnpj"
                      control={
                        <Radio
                          icon={<Lens />}
                          checkedIcon={<Lens />}
                          classes={{
                            root: classes.rootRadio,
                            checked: classes.checked
                          }}
                        />
                      }
                      label="CNPJ"
                      classes={{ label: classes.rootLabel }}
                    />
                    <FormControlLabel
                      value="passport"
                      control={
                        <Radio
                          icon={<Lens />}
                          checkedIcon={<Lens />}
                          classes={{
                            root: classes.rootRadio,
                            checked: classes.checked
                          }}
                        />
                      }
                      label={i18n.t("KYC_PASSPORT")}
                      classes={{ label: classes.rootLabel }}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Input
                classes={{
                  root: classes.inputRoot,
                  underline: classes.inputCssUnderline,
                  input: classes.inputCssCenter
                }}
                placeholder={i18n.t("KYC_DOCUMENT_PLACEHOLDER")}
                value={this.state.document}
                onChange={this.handleInput("document")}
                inputComponent={inputMask}
              />
            </Grid>
          </Grid>
          <Grid
            container
            direction="row"
            justify="space-around"
            className={style.formGroup}
          >
            <Grid item xs={12} sm={5}>
              <div className={style.textGreen}>
                {i18n.t("DEPOSIT_INF_MODAL_STATE")}
              </div>
              <Select
                classes={{ selectMenu: classes.underlineItems }}
                MenuProps={MenuProps}
                value={this.state.state}
                input={
                  <Input
                    classes={{
                      underline: classes.underline
                    }}
                  />
                }
                inputProps={{
                  classes: {
                    icon: classes.icon
                  }
                }}
                renderValue={value => value}
                onChange={this.handleInput("state")}
              >
                {this.listStates()}
              </Select>
            </Grid>
            <Grid item xs={1} />
            <Grid item xs={12} sm={5}>
              <div className={style.textGreen}>
                {i18n.t("DEPOSIT_INF_MODAL_CITY")}
              </div>
              <Select
                classes={{ selectMenu: classes.underlineItems }}
                MenuProps={MenuProps}
                value={this.state.city}
                input={
                  <Input
                    classes={{
                      underline: classes.underline
                    }}
                  />
                }
                inputProps={{
                  classes: {
                    icon: classes.icon
                  }
                }}
                renderValue={value => value}
                onChange={this.handleInput("city")}
              >
                {this.listStates()}
              </Select>
            </Grid>
          </Grid>

          <Grid
            container
            direction="row"
            justify="space-around"
            className={style.formGroup}
          >
            <Grid item xs={12} sm={5}>
              <div className={style.textGreen}>
                {i18n.t("DEPOSIT_INF_MODAL_ADDRESS")}
              </div>
              <Input
                classes={{
                  root: classes.inputRoot,
                  underline: classes.inputCssUnderline,
                  input: classes.inputCssCenter
                }}
                placeholder={i18n.t("DEPOSIT_INF_MODAL_ADDRESS")}
                value={this.state.address}
                onChange={this.handleInput("address")}
              />
            </Grid>
            <Grid item sm={2} />
            <Grid item xs={12} sm={5}>
              <div className={style.textGreen}>
                {i18n.t("DEPOSIT_INF_MODAL_CEP")}
              </div>
              <Input
                classes={{
                  root: classes.inputRoot,
                  underline: classes.inputCssUnderline,
                  input: classes.inputCssCenter
                }}
                placeholder={i18n.t("DEPOSIT_INF_MODAL_CEP")}
                value={this.state.cep}
                onChange={this.handleInput("cep")}
                inputProps={{ maxLength: 9 }}
              />
            </Grid>
            <Grid item sm={1} />
          </Grid>

          <Grid container justify="center">
            <Grid item xs={5}>
              <ButtonContinue
                label={i18n.t("DEPOSIT_INF_MODAL_BTN_CONTINUE")}
                action={this.checkAllInputs() ? this.validateForm : () => null}
                loading={loading}
              />
            </Grid>
          </Grid>
        </Grid>
      </div>
    );
  }
}

InformationModal.propTypes = {
  classes: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  setLoading: PropTypes.func,
  setUserData: PropTypes.func,
  setModalSteps: PropTypes.func,
  depositGetStates: PropTypes.func.isRequired,
  depositGetCity: PropTypes.func.isRequired,
  states: PropTypes.array,
  city: PropTypes.array
};

const mapStateToProps = store => ({
  loading: store.deposit.loading,
  states: store.deposit.location.states,
  city: store.deposit.location.city,
  loadingState: store.deposit.loadingState,
  loadingCity: store.deposit.loadingState
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setLoading,
      setUserData,
      setModalSteps,
      depositGetStates,
      depositGetCity
    },
    dispatch
  );

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withStyles(customStyle)(InformationModal));