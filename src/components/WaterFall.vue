<template>
    <div class="waterfall-container" ref="containerRef" @scroll="handleScroll">
        <div class="waterfall-list">
            <div 
            class="waterfall-item"
            v-for="(item,index) in state.cardList"
            :key="item.id"
            :style="{
                width:`${state.cardPos[index].width}px`,
                height:`${state.cardPos[index].height}px`,
                transform:`translate3d(${state.cardPos[index].x}px,${state.cardPos[index].y}px,0)`
            }">
                <slot name="item" :item="item" :index="index"></slot>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { rafThrottle } from '@/utils/tools';
import type { ICardItem, ICardPos, IWaterFallProps } from '@/utils/type';
import { computed, onMounted, reactive, ref } from 'vue';


const containerRef = ref<HTMLDivElement | null>(null)
const props = defineProps<IWaterFallProps>()
defineSlots<{
    item(props:{item:ICardItem,index:number}) :any
}>()


const state = reactive({
    isFinish:false,
    loading:false,
    page:1,
    cardWidth:0,//卡片宽度
    cardList:[] as ICardItem[],//卡片数据源
    cardPos:[] as ICardPos[],//卡片位置
    columnHeight:new Array(props.column).fill(0) as number[],
})
//封装一个发送请求获取数据的函数
const getCardList = async (page:number,pageSize:number) => {
    if(state.isFinish) return
    state.loading = true
    const list = await props.request(page,pageSize)
    state.page++
    if(!list.length){
        state.isFinish = true
        return
    }
    state.cardList = [...state.cardList,...list]
    computedCardPos(list)//根据请求位置计算卡片位置
    state.loading = false
}
//计算卡片位置,将位置保存到state.cardPos
const computedCardPos = (list:ICardItem[]) => {
    list.forEach((item,index) => {
        const cardHeight = Math.floor((item.height / item.width) * state.cardWidth)
        //第一行卡片的情况，紧挨排列
        if(index < props.column && state.cardList.length <= props.pageSize){
            state.cardPos.push({
                width:state.cardWidth,
                height:cardHeight,
                x:index ? index * (state.cardWidth + props.gap) :0,
                y:0
            })
            state.columnHeight[index] = cardHeight + props.gap
        }else{
            const {minIndex,minHeight} = minColumn.value
            state.cardPos.push({
                width:state.cardWidth,
                height:cardHeight,
                x:minIndex ? minIndex * (state.cardWidth + props.gap) : 0,
                y:minHeight
            })
            state.columnHeight[minIndex] += cardHeight + props.gap
        }
    })
}
//获取最小列和最小列高度
const minColumn = computed(() => {
    let minIndex = -1,
        minHeight = Infinity
    state.columnHeight.forEach((item,index) => {
        if(item < minHeight){
            minHeight = item
            minIndex = index
        }
    })
    return {
        minIndex,
        minHeight
    }
})
const handleScroll = rafThrottle(() => {
  const { scrollTop, clientHeight, scrollHeight } = containerRef.value!;
  const bottom = scrollHeight - clientHeight - scrollTop;
  if (bottom <= props.bottom) {
    !state.loading && getCardList(state.page, props.pageSize);
  }
})
//初始化
const init = () => {
    if(containerRef.value){
        const containerWidth = containerRef.value.clientHeight
        state.cardWidth = (containerWidth - props.gap * (props.column - 1)) / props.column
        getCardList(state.page,props.pageSize) 
    }
}

onMounted(() => {
    init()
})
</script>

<style scoped lang="scss">
.waterfall{
    &-container{
        width: 100%;
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
    }
    &-list{
        width: 100%;
        position: relative;
    }
    &-item{
        position: absolute;
        left: 0;
        top: 0;
        box-sizing: border-box;
    }
}
</style>
