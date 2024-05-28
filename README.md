# tainyi-waterfall-demo
我们来手动实现一下仿小红书的瀑布流列表，如下图所示：<br />![屏幕截图 2024-05-28 194303.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1716896590384-c6b8372c-2753-4a4b-8933-1b18ace2e32a.png#averageHue=%238f8162&clientId=u5014c821-18f9-4&from=ui&id=u088b08d1&originHeight=1351&originWidth=2055&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=2979086&status=done&style=none&taskId=u98de366c-8d28-4043-9486-974e23fe2f8&title=)<br />这里注意一下我们为什么不去使用grid或者flex布局来实现这个瀑布流。我自己的理解是应用场景的区别，首先使用grid布局肯定可以实现宽高都不定的布局的，主要是在刚加载出来的时候给用户耳目一新的感觉，大部分应用于图标展示，但是我们这里的瀑布流列表是供用户浏览点击的，如果采用grid布局，用户长时间浏览的话很容易产生疲惫，影响用户体验。
<a name="WVVm8"></a>

# 定高实现

这里指的定高实现指的是小红书列表图片的展示，不包括字体。定高说的不是高度固定而是可以直接从后端获得图片的宽高。<br />**效果**<br />![屏幕截图 2024-05-28 195411.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1716897296537-176fc2d4-8877-4884-9cb8-00c525d0cc1c.png#averageHue=%23e1a43f&clientId=u5014c821-18f9-4&from=ui&height=458&id=u5a84ef2c&originHeight=1106&originWidth=1339&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=18232&status=done&style=none&taskId=ufec49d20-9096-496e-9ced-d2fd9ee7e7b&title=&width=554)<br />数据源是直接从网上找的json格式的文件<br />![屏幕截图 2024-05-28 195553.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1716897398160-fad6f65e-4f67-4403-9ad5-b443196972f5.png#averageHue=%232c2f37&clientId=u5014c821-18f9-4&from=ui&id=u77ab6ba2&originHeight=1599&originWidth=2559&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=622087&status=done&style=none&taskId=u21d07598-fbef-439c-bb04-85fbb138f77&title=)<br />接下来，让我们来详细分析瀑布流的实现。<br />首先关于瀑布流的排列规则是这样的，**第一列紧凑排布，从第二列开始我们先从每列高度最小的那一列开始排布，一直往下**。<br />那我们如何去实现每项列表的排布呢，我们可以使**父容器实现相对定位，列表项进行绝对定位**，初始位置位于父容器左上角。<br />再计算每个列表项的宽高，同时还有他的x坐标与y坐标。<br />**最后再给每个列表项设置样式**（宽，高，根据x，y坐标得到的偏移量transform）即可得到我们的瀑布流列表。<br />此外还有一些细节，如下拉刷新，获取列表数据，详细请看代码，这里给出关于列表项位置计算的核心代码。

```javascript
//计算卡片位置,将位置保存到state.cardPos
const computedCardPos = (list:ICardItem[]) => {
  list.forEach((item,index) => {
    const cardHeight = Math.floor((item.height / item.width) * state.cardWidth)
    //第一行卡片的情况，紧挨排列
    if(index < props.column && state.cardList.length <= props.pageSize){
      state.cardPos.push({
        width:state.cardWidth,
        height: cardHeight,
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
```

<a name="CUH5O"></a>

# 不定高的实现

这里的不定高指的是小红书实际中，**图片下面还有标题，作者，点赞等一些文本内容，这些高度大小并不确定，需要我们在挂载之后渲染之前（nextTick）进行计算宽高，确定x，y坐标等工作。**<br />同时小红书的瀑布流还具有**响应式**，在视窗大小变化时，列表项的大小也会发生变化。<br />让我们来看看是如何实现不定高的：<br />我们首先要封装一个列表项组件，内容包括图片，标题，作者，点赞....<br />**总体思路与定高一致，也就是计算出列表项的宽高，x，y坐标，再在样式中设置，实现虚拟列表**。<br />详细步骤：<br />首先在初始化时，我们就根据列数的大小和列与列之间的距离计算出**每个列表项的宽度**，也就是列表项中图片的宽度。<br />其次我们根据图片的大小与列表宽度之间的**比例关系计算出图片的高度**，将图片宽度传入列表项组件中，在样式中设置图片宽度。<br />但是此时我们得不到关于列表项的更多信息，我们只能等到使用nextTick，在**渲染之前**，得到列表项的DOM对象，通过DOM得到元素高度，再像定高一样通过最小列高度和最小列索引计算坐标，来设置样式，实现瀑布流。<br />关键宽高与坐标计算：

```javascript
const getCardList = async (page: number, pageSize: number) => {
  if (state.isFinish) return;
  state.loading = true;
  const list = await props.request(page, pageSize);
  state.page++;
  if (!list.length) {
    state.isFinish = true;
    return;
  }
  state.cardList = [...state.cardList, ...list];
  computedCardPos(list);
  state.loading = false;
};

const computedCardPos = async (list: ICardItem[]) => {
  computedImageHeight(list);
  await nextTick();
  computedRealDomPos(list);
};
 
const computedImageHeight = (list: ICardItem[]) => {
  list.forEach((item) => {
    const imageHeight = Math.floor((item.height * state.cardWidth) / item.width);
    state.cardPos.push({
      width: state.cardWidth,
      imageHeight: imageHeight,
      cardHeight: 0,
      x: 0,
      y: 0,
    });
  });
};

const computedRealDomPos = (list: ICardItem[]) => {
  const children = listRef.value!.children;
  list.forEach((_, index) => {
    const nextIndex = state.preLen + index;
    const cardHeight = children[nextIndex].getBoundingClientRect().height;
    if (index < props.column && state.cardList.length <= props.pageSize) {
      state.cardPos[nextIndex] = {
        ...state.cardPos[nextIndex],
        cardHeight: cardHeight,
        x: nextIndex % props.column !== 0 ? nextIndex * (state.cardWidth + props.gap) : 0,
        y: 0,
      };
      state.columnHeight[nextIndex] = cardHeight + props.gap;
    } else {
      const { minIndex, minHeight } = minColumn.value;
      state.cardPos[nextIndex] = {
        ...state.cardPos[nextIndex],
        cardHeight: cardHeight,
        x: minIndex ? minIndex * (state.cardWidth + props.gap) : 0,
        y: minHeight,
      };
      state.columnHeight[minIndex] += cardHeight + props.gap;
    }
  });
  state.preLen = state.cardPos.length;
};
```

![屏幕截图 2024-05-28 204918.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1716900563591-8da009cd-7f1c-488b-85d6-a42cf561e6b0.png#averageHue=%23a2b43b&clientId=u5014c821-18f9-4&from=ui&id=uae93e352&originHeight=1599&originWidth=2557&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=249210&status=done&style=none&taskId=u12c793b2-17ef-46aa-89d3-0c980b93dd4&title=)
<a name="Be8ac"></a>

## 关于响应式的实现

响应式的实现，**实际上就是监听边界尺寸的变化，这里我们用到了ResizeObserver**<br />![屏幕截图 2024-05-28 205322.png](https://cdn.nlark.com/yuque/0/2024/png/40660095/1716900809820-605a73ee-012a-4215-866f-f65d55574879.png#averageHue=%23f3f2f2&clientId=u5014c821-18f9-4&from=ui&height=82&id=udef8a3d0&originHeight=196&originWidth=1087&originalType=binary&ratio=1.5&rotation=0&showTitle=false&size=26683&status=done&style=none&taskId=u803db215-4ee0-4792-86e6-4ba6cda3660&title=&width=455)<br />我们创造一个ResizeObserver并传入一个回调函数，在变化时调用，在挂载时ResizeObserver.observe()指定监听对象，卸载时取消对指定对象的监听--ResizeObserver.unobserve()<br />实现：<br />在app.vue中我们监听容器的大小变化，如果尺寸大小发生变化，**我们就根据容器宽度的大小，改变列数**。<br />同时在CardWaterFall.vue中我们通用**监听容器大小的变化，发生变化，则意味列数发生改变，我们就重新计算列表项位置，并设置样式，实现响应式**。
