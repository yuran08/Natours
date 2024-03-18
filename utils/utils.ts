export const showObjAllowedFields = (
  obj: { [key: string]: any },
  ...allowedFields: string[]
) => {
  let newObj: { [key: string]: any } = {}
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

export const showRemovedFieldsObj = (
  obj: { [key: string]: any },
  ...removedFields: string[]
) => {
  let newObj: { [key: string]: any } = {}
  Object.keys(obj).forEach(el => {
    if (removedFields.includes(el)) return
    newObj[el] = obj[el]
  })
  return newObj
}
