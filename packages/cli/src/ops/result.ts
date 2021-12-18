type OpType = 'inject' | 'add' | 'shell';
type OpStatus = 'added' | 'executed' | 'inject' | 'ignored' | 'skipped' | 'error'

export default (
    type: OpType,
    subject: string,
    start = new Date()
) => (
    status: OpStatus,
    payload: null | Record<string, any> = null,
    end = new Date()
) => ({
    type,
    subject,
    status,
    timing: end.getTime() - start.getTime(),
    ...(payload && { payload })
  })