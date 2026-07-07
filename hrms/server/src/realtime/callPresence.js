// Live "who's currently on a call" cache — deliberately NOT persisted. A call
// can end without a clean call:end event firing (crashed tab, closed laptop),
// so DB state would drift stale; this is rebuilt from nothing on every
// connect/disconnect and is never trusted as anything but a live signal.
// CallSession in Mongo is the separate, persisted audit trail.
const busyUsers = new Map();

const key = ({ id, kind }) => `${kind}:${id}`;

export const getBusyInfo = (identity) => busyUsers.get(key(identity)) || null;

export const isBusy = (identity) => busyUsers.has(key(identity));

export const setBusy = (identity, info) => {
  busyUsers.set(key(identity), info);
};

export const clearBusy = (identity) => {
  busyUsers.delete(key(identity));
};
