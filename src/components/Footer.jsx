import React, { Component } from 'react';
import PropTypes from 'prop-types';
export default class Footer extends Component {
    static propTypes = {
        large: PropTypes.func.isRequired,
        small: PropTypes.func.isRequired,
        rotate: PropTypes.func.isRequired,
        download: PropTypes.func.isRequired,
        type: PropTypes.string.isRequired,
        curImgIndex: PropTypes.number.isRequired,
        total: PropTypes.number.isRequired
    };
    render() {
        const { large, small, rotate, download, type, curImgIndex, total } = this.props;
        return (
            <div className="footer">
                {type === 'images' && (
                    <p className="count">
                        {curImgIndex}/{total}
                    </p>
                )}
                <span className="iconfont icon-fangda large-icon" onClick={() => large(0.2)}></span>
                <span className="iconfont icon-suoxiao small-icon" onClick={() => small(0.2)}></span>
                <span className="iconfont icon-xuanzhuan rotate-icon" onClick={rotate}></span>
                <span className="iconfont icon-xiazai download-icon" onClick={download}></span>
            </div>
        );
    }
}
