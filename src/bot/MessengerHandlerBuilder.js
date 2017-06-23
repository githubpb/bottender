/* @flow */
import warning from 'warning';

import * as constants from '../constants';

import BasicHandlerBuilder, {
  type Predicate,
  type Handler,
  type Pattern,
  normalizeHandler,
  matchPattern,
} from './BasicHandlerBuilder';

export default class MessengerHandlerBuilder extends BasicHandlerBuilder {
  onMessage(predicate: Predicate, handler: Handler) {
    this.on(
      context =>
        context.event.isMessage && !context.event.isEcho && predicate(context),
      handler
    );
    return this;
  }

  onText(pattern: Pattern, handler: Handler) {
    warning(
      typeof pattern === 'string' || pattern instanceof RegExp,
      `'onText' only accepts string or regex, but received ${typeof pattern}`
    );
    this.onMessage(
      context =>
        context.event.isTextMessage &&
        !context.event.isEcho &&
        matchPattern(pattern, context.event.message.text),
      handler
    );
    return this;
  }

  onPostback(predicate: Predicate, handler: Handler) {
    this.on(context => context.event.isPostback && predicate(context), handler);
    return this;
  }

  onPayload(pattern: Pattern, handler: Handler) {
    warning(
      typeof pattern === 'string' || pattern instanceof RegExp,
      `'onPayload' only accepts string or regex, but received ${typeof pattern}`
    );
    this.on(({ event }) => {
      if (event.isPostback && matchPattern(pattern, event.postback.payload)) {
        return true;
      }
      if (
        event.isMessage &&
        event.message.quick_reply &&
        matchPattern(pattern, event.message.quick_reply.payload)
      ) {
        return true;
      }
      return false;
    }, handler);
    return this;
  }

  onGetStarted(handler: Handler) {
    this.onPayload(constants.payload.GET_STARTED, handler);
    return this;
  }

  onQuickReply(predicate: Predicate, handler: Handler) {
    this.onMessage(
      context => !!context.event.message.quick_reply && predicate(context),
      handler
    );
    return this;
  }

  onEcho(predicate: Predicate, handler: Handler) {
    this.on(context => context.event.isEcho && predicate(context), handler);
    return this;
  }

  onEchoText(pattern: Pattern, handler: Handler) {
    this.on(
      context =>
        context.event.isEcho &&
        matchPattern(pattern, context.event.message.text), // FIXME
      handler
    );
    return this;
  }

  onRead(predicate: Predicate, handler: Handler) {
    this.on(context => context.event.isRead && predicate(context), handler);
    return this;
  }

  onDelivery(predicate: Predicate, handler: Handler) {
    this.on(context => context.event.isDelivery && predicate(context), handler);
    return this;
  }

  onUnhandled(handler: Handler) {
    this._fallbackHandler = {
      predicate: context =>
        !context.event.isEcho &&
        !context.event.isRead &&
        !context.event.isDelivery,
      handler: normalizeHandler(handler),
    };
    return this;
  }
}
