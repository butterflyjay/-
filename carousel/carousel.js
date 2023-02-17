import { Module, registModule, DefineElement, DefineElementManager, VirtualDom, NEvent } from '../nodom/dist/nodom.esm.js';
export class UICarousel extends Module {
  __itemLen = 0;
  __currentIndex = 0;  //当前展示项编号
  __width = 600;       //默认宽度
  __height = 400;      //默认高度
  __active = 0;
  template(props) {
    props?.height && (this.__height = Number(props.height));
    props?.width && (this.__width = Number(props.width));
    props?.itemLen && (this.__itemLen = Number(props.itemLen));
    return `
            <div class="ui-carousel">
                <div class="ui-carousel-content" 
                key="$carouselContent" >
                    <slot></slot>
                </div>
                <div class="ui-carousel-prev">
                    <span id="__ui-carousel_prev" e-click="__prev">&lt;</span>
                </div>
                <div class="ui-carousel-next">
                    <span id="__ui-carousel_next" e-click="__next">&gt;</span>
                </div>
                <ul class="ui-carousel-point-box" key="$carouselPoint">
                </ul>
            </div>
        `
  }
  onCompile() {
    let oTree = this.originTree;
    oTree.setProp("style", `height: ${this.__height}px; width: ${this.__width}px;`)
    for (let i = 0; i < this.__itemLen; i++) {
      let point = new VirtualDom("li", this.getDomKeyId() + '');
      point.addEvent(new NEvent(this, "click", "__point"));
      point.setProp("class", `ui-carousel-point ${i === 0 ? "ui-carousel-point-active" : ""}`);
      point.setProp("index", i + "");
      oTree.children[3].children.push(point);
      point.parent = oTree.children[3];
    }
    let contents = this.srcDom.vdom.children[0].children;
    contents.push(contents[0].clone(true));
    oTree = null;
    contents = null;
  }
  /**
   * 向前点击
   */
  __prev() {
    this.__currentIndex--;
    if (this.__currentIndex < 0) {
      this.__currentIndex = this.__itemLen;
      this.contentNode.style.transition = "none";
      this.contentNode.style.transform = `translateX(-${this.__itemLen * this.__width}px)`;
      this.contentNode.clientHeight;
      this.__currentIndex--;
    }
    const ds = "-" + this.__currentIndex * this.__width + 'px';
    this.__move(ds);
  }
  /**
   * 向后点击
   */
  __next() {
    this.__currentIndex++;
    if (this.__currentIndex > this.__itemLen) {
      this.__currentIndex = 0;
      this.contentNode.style.transition = "none";
      this.contentNode.style.transform = `translateX(0px)`;
      this.contentNode.clientHeight;
      this.__currentIndex++;
    }
    const ds = "-" + this.__currentIndex * this.__width + 'px';
    this.__move(ds);
  }
  /**
   * 滑动
   * @param {string} ds 滑动距离
   */
  __move(ds) {
    this.contentNode.style.transition = "1.1s";
    this.contentNode.style.transform = `translateX(${ds})`;
    const el = this.getElement("$carouselPoint");
    el.children[this.__active].classList.remove("ui-carousel-point-active");
    this.__active = this.__currentIndex === this.__itemLen ? 0 : this.__currentIndex;
    el.children[this.__active].classList.add("ui-carousel-point-active");
  }
  __point(model, vdom, Nevent, event) {
    this.__currentIndex = Number(vdom.props.index);
    this.__move(`-${this.__currentIndex * this.__width}px`);
  }
  onFirstRender() {
    this.contentNode = this.getElement("$carouselContent");
  }
}
export class UICarouselItem extends DefineElement {
  constructor(node, module) {
    super(node)
    if (!node.parent && node.parent.tagName !== "ui-carousel") {
      return console.error("tag:<ui-carousel-item><ui-carousel-item> can only beused in <ui-carousel></ui-carousel>");
    }
    if (node.hasProp('hidden')) {
      node.parent.remove(node);
      return;
    }
    const carousel = node.parent;
    carousel.setProp("itemLen", (carousel.getProp("itemLen") || 0) + 1);
    node["itemKey"] = carousel.getProp("itemLen");
    node.setProp("class", "ui-carousel-item");
    node.setProp("style", `width: ${node.parent.props.get("width")}px;`)
  }
}
registModule(UICarousel, 'ui-carousel');
DefineElementManager.add(UICarouselItem, 'ui-carousel-item');