import React from 'react';
import './App.scss';
import Header from './components/Header';
import Footer from './components/Footer';

export default class App extends React.Component {
    constructor() {
        super();
        // 额外属性
        this.pointType = 'default';
        // 绑定全局尺寸变化
        const { scaling } = this.state;
        window.onresize = () => this._mouseEnterImg(scaling);
        // 接收消息
        try {
            const ipcRenderer = window.electron.ipcRenderer;
            ipcRenderer.on('see-portrait', (event, content) => {
                this.setState(content);
            });
        } catch (error) {}
    }
    state = {
        // 传进来的数据
        type: 'images', // 把type设置成其他类型，可以隐藏掉左右选择按钮和底部
        curImgIndex: 0, //当前图片索引
        imgs: ['https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1589185562616&di=532ad9974639cd4e863cf795e66e3dc4&imgtype=0&src=http%3A%2F%2Ft8.baidu.com%2Fit%2Fu%3D1484500186%2C1503043093%26fm%3D79%26app%3D86%26f%3DJPEG%3Fw%3D1280%26h%3D853'],
        // 本地组件数据
        rotateAngle: 0, // 旋转角度
        scaling: 1, // 缩放比例
        moveX: 0, // 移动的宽度
        moveY: 0, // 移动的高度
        leftBtnShow: false, // 向左按钮显示
        rightBtnshow: false
    };
    _large(num) {
        let { scaling } = this.state;
        scaling = Math.trunc(scaling) >= 10 ? 10 : scaling + num; // 缩放最大10倍
        this.setState({
            scaling
        });
        this._mouseEnterImg(scaling);
    }
    _small(num) {
        let { scaling, moveX, moveY } = this.state;
        scaling = scaling - num <= 0.1 ? 0.1 : scaling - num; // 缩放最小0.1倍
        if (this.pointType === 'move') {
            let n = Math.round((scaling - 1) / num);
            if (moveX !== 0) {
                moveX -= moveX / n;
            }
            if (moveY !== 0) {
                moveY -= moveY / n;
            }
        } else {
            moveX = 0;
            moveY = 0;
        }
        this.setState({
            scaling,
            moveX,
            moveY
        });
        this._mouseEnterImg(scaling);
    }
    // 滚轮滚动
    _mouseWheel = e => {
        e.preventDefault();
        if (e.deltaY < 0) {
            this._large(0.4);
        } else {
            this._small(0.4);
        }
    };
    _rotate = () => {
        let { rotateAngle } = this.state;
        rotateAngle += 90;
        if (rotateAngle === 360) {
            rotateAngle = 0;
        }
        this.setState({
            rotateAngle,
            scaling: 1
        });
    };
    _download = () => {
        let aD = document.createElement('a');
        aD.href = this.refImg.src;
        aD.download = `图片_${new Date().getTime() * Math.floor(Math.random() * 10000)}`;
        aD.click();
    };
    // 鼠标按下
    _mouseDown = e => {
        e.preventDefault();
        const { scaling } = this.state;
        if (this.pointType === 'default') return;
        // 获取img-box img的宽度和高度
        const boxW = document.body.clientWidth;
        const boxH = document.body.clientHeight - 26 - 60;
        const imgW = this.refImg.width * scaling;
        const imgH = this.refImg.height * scaling;
        let startX = e.clientX; // 鼠标按下的位置
        let startY = e.clientY;
        this.refImg.onmousemove = e => {
            e.preventDefault();
            let { moveX, moveY } = this.state;
            const currentX = e.clientX;
            const currentY = e.clientY;
            let disX = currentX - startX; // 鼠标移动的像素 往右 往上是正数
            let disY = currentY - startY;
            if (imgW > boxW) {
                if (disX > 0 && (imgW - boxW) / 2 - moveX * scaling > 0) {
                    // 往右走
                    moveX += disX / scaling;
                    if ((imgW - boxW) / 2 - moveX * scaling < 0) {
                        moveX = (imgW - boxW) / 2 / scaling;
                    }
                } else if (disX < 0 && (imgW - boxW) / 2 + moveX * scaling > 0) {
                    // 往左走
                    moveX += disX / scaling;
                    if ((imgW - boxW) / 2 + moveX * scaling < 0) {
                        moveX = ((imgW - boxW) / 2 / scaling) * -1;
                    }
                }
            }
            if (imgH > boxH) {
                if (disY > 0 && (imgH - boxH) / 2 - moveY * scaling > 0) {
                    // 往下走
                    moveY += disY / scaling;
                    if ((imgH - boxH) / 2 - moveY * scaling < 0) {
                        moveY = (imgH - boxH) / 2 / scaling;
                    }
                } else if (disY < 0 && (imgH - boxH) / 2 + moveY * scaling > 0) {
                    // 往上走
                    moveY += disY / scaling;
                    if ((imgH - boxH) / 2 + moveY * scaling < 0) {
                        moveY = ((imgH - boxH) / 2 / scaling) * -1;
                    }
                }
            }
            startX = currentX;
            startY = currentY;
            this.setState({
                moveX,
                moveY
            });
        };
        // 鼠标弹起停止移动
        this.refImg.onmouseleave = () => {
            this.refImg.onmousemove = null;
            this.refImg.onmouseup = null;
        };
        this.refImg.onmouseup = () => {
            this.refImg.onmousemove = null;
            this.refImg.onmouseup = null;
        };
    };
    // 鼠标进入图片，设置标识
    _mouseEnterImg = scaling => {
        const clientW = document.body.clientWidth;
        const clientH = document.body.clientHeight - 26 - 60;
        if (scaling * this.refImg.width > clientW || scaling * this.refImg.height > clientH) {
            this.pointType = 'move';
        } else {
            this.pointType = 'default';
        }
    };
    // 向左 进入
    _mouseMoveChoose = e => {
        const clientW = document.body.clientWidth;
        const pX = e.clientX;
        if (pX <= 100) {
            this.setState({
                leftBtnShow: true
            });
        } else {
            this.setState({
                leftBtnShow: false
            });
        }
        if (clientW - pX <= 100) {
            this.setState({
                rightBtnshow: true
            });
        } else {
            this.setState({
                rightBtnshow: false
            });
        }
    };
    _mouseLeaveChoose = e => {
        const clientH = document.body.clientHeight;
        const pY = e.clientY;
        if (pY <= 26 || clientH - pY <= 60) {
            this.setState({
                leftBtnShow: false,
                rightBtnshow: false
            });
        }
    };
    // 选择图片
    _chooseImage = p => {
        let { curImgIndex, imgs } = this.state;
        if (p === 'left' && curImgIndex !== 0) {
            this.setState({
                curImgIndex: curImgIndex - 1,
                rotateAngle: 0,
                scaling: 1,
                moveX: 0,
                moveY: 0
            });
        }
        if (p === 'right' && curImgIndex + 1 !== imgs.length) {
            this.setState({
                curImgIndex: curImgIndex + 1,
                rotateAngle: 0,
                scaling: 1,
                moveX: 0,
                moveY: 0
            });
        }
    };
    render() {
        const { type, rotateAngle, scaling, moveX, moveY, curImgIndex, imgs, leftBtnShow, rightBtnshow } = this.state;
        // 要显示的图片路由
        let url = imgs[curImgIndex];
        return (
            <div className="app">
                <Header></Header>
                <div className="img-box" ref={imgBox => (this.refImgBox = imgBox)} onMouseMove={this._mouseMoveChoose} onMouseLeave={this._mouseLeaveChoose}>
                    <img ref={img => (this.refImg = img)} src={url} alt="img" style={{ transform: `rotate(${rotateAngle}deg) scale(${scaling},${scaling}) translate(${moveX}px,${moveY}px)`, cursor: this.pointType }} onMouseEnter={() => this._mouseEnterImg(scaling)} onWheel={this._mouseWheel} onMouseDown={this._mouseDown} />
                </div>
                {type === 'images' && (
                    <div className="choose">
                        {leftBtnShow && (
                            <div className="left" style={{ backgroundColor: curImgIndex === 0 ? '#D0D0D0' : '#939393', cursor: curImgIndex === 0 ? 'default' : 'pointer' }} onClick={() => this._chooseImage('left')}>
                                <span className="iconfont icon-xiangzuo"></span>
                            </div>
                        )}
                        {rightBtnshow && (
                            <div className="right" style={{ backgroundColor: curImgIndex + 1 === imgs.length ? '#D0D0D0' : '#939393', cursor: curImgIndex + 1 === imgs.length ? 'default' : 'pointer' }} onClick={() => this._chooseImage('right')}>
                                <span className="iconfont icon-arr-right"></span>
                            </div>
                        )}
                    </div>
                )}
                <Footer large={num => this._large(num)} small={num => this._small(num)} rotate={this._rotate} download={this._download} type={type} curImgIndex={curImgIndex + 1} total={imgs.length}></Footer>
            </div>
        );
    }
}
