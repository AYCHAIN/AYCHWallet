import {
  put,
  call
} from "redux-saga/effects";
import {
  internalServerError
} from "../../errors/statusCodeMessage";

import {
  getAuthToken
} from "../../../utils/localStorage";
import {
  convertBiggestCoinUnit
} from "../../../utils/numbers";
import {
  convertToLocaleDate
} from "../../../utils/strings";

// importar servico
import PaymentService from "../../../services/paymentService";
import CoinService from "../../../services/coinService";

// iniciar servico
const paymentService = new PaymentService();
const coinService = new CoinService();

export function* setModalStepSaga(payload) {
  yield put({
    type: "SET_MODAL_PAY_STEP_REDUCER",
    step: payload.step
  });
}

export function* getCoinsEnabledSaga() {
  try {
    let token = yield call(getAuthToken);
    let response = yield call(paymentService.getCoins, token);

    const services = response.data.services;

    const coins = services.reduce((availableCoins, coin) => {
      if (coin.status === 'active') {
        const active = {
          title: coin.abbreviation.toUpperCase(),
          value: {
            abbreviation: coin.abbreviation,
            address: coin.address
          },
          img: `/images/icons/coins/${coin.abbreviation}.png`
        }

        availableCoins.push(active);
      }

      return availableCoins;
    }, []);

    yield put({
      type: "GET_COINS_REDUCER",
      coins: coins
    });
  } catch (error) {
    yield put(internalServerError());
  }
}

export function* setPaymentSaga(payload) {
  try {
    // abrir loading
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    const value = parseFloat(payload.pay.value);
    const {abbreviation, address} = payload.pay.coin;

    const token = yield call(getAuthToken);
    const amountResponse = yield call(paymentService.getCoinAmountPay, token, abbreviation, value);
    const balanceResponse = yield call(coinService.getCoinBalance, abbreviation, address, token);

    //console.log("response balance", balanceResponse);

    const balance = balanceResponse.data.data.available;
    const amount = amountResponse.data.data.value;

    //console.log("value", payload.pay);
    //console.log("amount", response.data.data.price);

    const data = {
      number: payload.pay.number,
      coin: payload.pay.coin,
      balance: convertBiggestCoinUnit(balance, 8),
      amount: convertBiggestCoinUnit(amount, 8),
      value: value.toFixed(2).replace('.', ','),
      assignor: payload.pay.assignor,
      name: payload.pay.name,
      dueDate: payload.pay.dueDate,
      description: payload.pay.description,
      cpfCnpj: payload.pay.cpfCnpj
    };

    //console.log("response data", data);

    yield put({
      type: "SET_PAYMENT_REDUCER",
      payload: data
    });
  } catch (error) {
    yield put(internalServerError());
    yield put({
      type: "CHANGE_SKELETON_ERROR_STATE",
      state: true
    });

    return;
  }
}

export function* getFeePaymentSaga(payload) {
  try {
    // abrir loading
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    let response = yield call(
      coinService.getFee,
      payload.coin,
      payload.fromAddress,
      payload.toAddress,
      payload.amount,
      payload.decimalPoint
    );

    yield put({
      type: "GET_FEE_PAYMENT_REDUCER",
      fee: response
    });
  } catch (error) {
    yield put(internalServerError());
  }
}

export function* setFeePaymentSaga(payload) {
  yield put({
    type: "SET_FEE_PAYMENT_REDUCER",
    fee: payload.fee
  });
}

export function* getInvoiceSaga(payload) {
  try {
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    let token = yield call(getAuthToken);
    let response = yield call(paymentService.getInvoice, token, payload.number);

    const data = {
      number: payload.number,
      value: response.value,
      assignor: response.assignor,
      dueDate: convertToLocaleDate(response.dueDate) || ""
    };

    yield put({
      type: "GET_INVOICE_REDUCER",
      payment: data
    });
  } catch (error) {
    yield put(internalServerError());
  }
}

export function* getHistoryPaySaga() {
  try {
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    let token = yield call(getAuthToken);
    let response = yield call(paymentService.getHistory, token);

    let data = [];
    if (response.payments) {
      data = response.payments;
    }

    yield put({
      type: "GET_HISTORY_PAY_REDUCER",
      history: data
    });
  } catch (error) {
    yield put(internalServerError());
  }
}

export function* confirmPaySaga() {
  try {
    // ligar o loading
    yield put({
      type: "SET_LOADING_REDUCER",
      payload: true
    });

    yield put({
      type: "SET_CLEAR_PAYMENT_REDUCER"
    });

    yield put({
      type: "SET_MODAL_PAY_STEP_REDUCER",
      step: 5
    });

    // libearar loading

    // limpar reducer
  } catch (error) {
    yield put(internalServerError());
  }
}