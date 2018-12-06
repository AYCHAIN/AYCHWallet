import React from "react";
import PropTypes from "prop-types";

// LOCAL COMPONENTS
import Header from "../components/header";
import DepositModal from "../modal/deposit";
import ConfirmModal from "../modal/confirm";

//REDUX
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

// GLOBAL COMPONENTS
import Loading from '../../../components/loading'

// STYLE
import style from "./style.css";

//FUNCTIONS
import { getChatBundle } from './functions'

//UTILS
import i18n from "./../../../utils/i18n"

class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chatTargetContent: undefined,
      bundleCalled: false,
      lastAdOwnerId: -1,
      lastBuyerId: -1
    }
  }
  componentDidMount() {
    this.callChatBundle()
  }
  componentDidUpdate() {
  }
  callChatBundle = () => {
    let { chatDetails } = this.props.p2pStore
    let { typeOfUser } = chatDetails
    let { seller, buyer, currentOrder } = chatDetails
    // if (!buyer || (buyer && !buyer.id)) return;
    let { id: buyerId } = buyer || {}
    let { id: adOwnerId } = seller
    let { id: adId } = currentOrder
    console.warn('chat/index.js Chat.callChatBundle'{typeOfUser, currentOrder, buyer, seller})
    if (typeOfUser === 'buyer') {
      getChatBundle({adId, adOwnerId, buyerId})
      this.setState({chatTargetContent: <Loading/>})
    } else {
      //TODO i18n
      this.setState({chatTargetContent: (<h1>{i18n.t("P2P_CHAT_SELECT_AN_USER_TO_CHAT")}</h1>) })
    }
  }

  render() {
    const { openDeposit } = this.props.p2pStore;
    return (
      <div>
        {openDeposit == true ? (
          <DepositModal />
        ) : (
          <div className={style.baseChat}>
            <Header />
            <div className={style.chatTarget+' chatTarget'} id={"chatTarget"}>
              {this.state.chatTargetContent}
              {/*Chat will be rendered here, and loading will be removed*/}
            </div>
          </div>
        )}
      </div>
    );
  }
}

Chat.propTypes = {
  p2pStore: PropTypes.object.isRequired
};

const mapStateToProps = store => ({
  p2pStore: store.p2p
});

const mapDispatchToProps = dispatch => bindActionCreators({}, dispatch);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);
