export enum ChildEvent {
    CLOSE       = 'close',
    DISCONNECT  = 'disconnect',
    ERROR       = 'error',
    EXIT        = 'exit',
}

export enum ParentEvent {
    BEFORE_EXIT         = 'beforeExit',
    DISCONNECT          = 'disconnect',
    EXIT                = 'exit',
    WARNING             = 'warning',
    REJECTION_HANDLED   = 'rejectionHandled',
    UNCAUGHT_EXCEPTION  = 'uncaughtException',
    UNHANDLED_REJECTION = 'unhandledRejection',
}
