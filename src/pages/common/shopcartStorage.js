/**
 * 该模块中主要对购物车中的数据进行 增加 修改 删除 查询
 */

const KEY = "GOODS"

/**
 * 获取本地存储的商品
 */
export const getLocalGoods = () => {
  return wx.getStorageSync(KEY) || {}
}

/**
 * 新增
 * @param {*} goods
 * {goods_id:129,goods_number:1}
 */
export const addGoods = goods => {
  // 1、从本地取出 {商品id1:数量,商品id2:数量}
  const localGoods = getLocalGoods()

  // 2、判断我们传递过来的goods的id，之前是否在本地存储过，如果存储过，把它的数量累加
  // 如果没有存储过，则新增一个属性名称:值
  if (localGoods[goods.goods_id]){ // 之前存储过
    localGoods[goods.goods_id] += goods.goods_number
  } else {
    localGoods[goods.goods_id] = goods.goods_number
  }

  // 3、操作本地的数据完毕之后，存储进去
  wx.setStorageSync(KEY,localGoods)
}

/**
 * 修改
 * goods {goods_id:129,goods_number:3}
 */
export const updateGoods = goods => {
  // 1、从本地取出 {商品id1:数量,商品id2:数量}
  const localGoods = getLocalGoods()

  // 2、更改本地商品的数量
  localGoods[goods.goods_id] = goods.goods_number

  // 3、保存回去
  wx.setStorageSync(KEY,localGoods)
}

/**
 * 删除
 * @param {*} goods_id 要删除的id
 */
export const deleteGoods = goods_id => {
  // 1、从本地取出 {商品id1:数量,商品id2:数量}
  const localGoods = getLocalGoods()

  // 2、删除id对应的属性
  delete localGoods[goods_id]

  // 3、保存回去
  wx.setStorageSync(KEY,localGoods)
}
