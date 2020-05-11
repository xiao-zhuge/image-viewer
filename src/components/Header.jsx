import React from 'react';

export default class Header extends React.Component {
    _min = () => {
        try {
            const ipcRenderer = window.electron.ipcRenderer;
            ipcRenderer.send('min-image-window');
        } catch (error) {}
    };
    _max = () => {
        try {
            const ipcRenderer = window.electron.ipcRenderer;
            ipcRenderer.send('max-image-window');
        } catch (error) {}
    };
    _close = () => {
        try {
            const ipcRenderer = window.electron.ipcRenderer;
            ipcRenderer.send('close-image-window');
        } catch (error) {}
    };
    render() {
        return (
            <div className="header">
                <div className="sys-min" onClick={this._min}>
                    <span className="iconfont icon-zuixiaohua min-icon"></span>
                </div>
                <div className="sys-max" onClick={this._max}>
                    <span className="iconfont icon-zuidahua max-icon"></span>
                </div>
                <div className="sys-close" onClick={this._close}>
                    <span className="iconfont icon-guanbi close-icon"></span>
                </div>
            </div>
        );
    }
}
