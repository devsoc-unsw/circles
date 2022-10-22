function unwrapSettled<T>(res: PromiseSettledResult<T>): T | undefined {
  if (res.status === 'rejected') {
    // eslint-disable-next-line no-console
    console.error('Rejected request at unwrap', res.reason);
    return undefined;
  }
  return res.value;
}

export default unwrapSettled;
