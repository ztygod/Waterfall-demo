export interface IWaterFallProps{
    gap:number,//卡片距离
    column:number,//瀑布流列数
    bottom:number,
    pageSize:number,
    request:(page:number,pageSize:number) => Promise<ICardItem[]>
}

export interface ICardItem{
    id:string | number,
    url:string,
    width:number,
    height:number,
    [key : string] : any
    // 这是一个索引签名（Index Signature），允许接口包含除了已定义属性外的任意属性。
    //这个索引签名允许 ICardItem 接口的实例拥有任意其他属性，并且这些属性的键必须是字符串类型，而值可以是任意类型。
}

export interface ICardPos{
    width:number,
    height:number,
    x:number,
    y:number
}

export interface IBookCardPos{
    width:number,
    imageHeight:number,
    cardHeight:number,
    x:number,
    y:number
}
