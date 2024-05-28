<template>
  <div class="app">
    <div class="container">
      <WaterFall :bottom="20" :column="4" :gap="10" :page-size="20" :request="getData">
        <template #item="{index}">
          <div
          class="card-box"
          :style="{
            background:colorArr[index % (colorArr.length - 1)]
          }">
          </div>
        </template>
      </WaterFall>
    </div>
  </div>
</template>

<script setup lang="ts">
import WaterFall from './components/WaterFall.vue';
import data1 from './config/data1.json'
import data2 from './config/data2.json'
import type { ICardItem } from './utils/type';

const colorArr = ["#409eff", "#67c23a", "#e6a23c", "#f56c6c", "#909399"];
const list1 : ICardItem[] = data1.data.items.map((i) => ({
  id:i.id,
  url:i.note_card.cover.url_pre,
  width:i.note_card.cover.width,
  height:i.note_card.cover.height
}))

const list2: ICardItem[] = data2.data.items.map((i) => ({
  id: i.id,
  url: i.note_card.cover.url_pre,
  width: i.note_card.cover.width,
  height: i.note_card.cover.height,
}))

const list = [...list1,...list2]

const getData = (page:number,pageSize: number) => {
  return new Promise<ICardItem[]>((resolve) => {
    //加一个定时器来模拟实际情况中异步请求所需要的时间
     setTimeout(() => {
      resolve(list.slice((page - 1) * pageSize,(page - 1) * pageSize + pageSize))
     },100)
  })
}
</script>

<style scoped lang="scss">
.app {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  .container {
    width: 620px;
    height: 600px;
    border: 1px solid red;
  }
  .card-box {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 10px;
  }
}
</style>
