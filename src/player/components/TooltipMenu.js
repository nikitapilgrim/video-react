import {useEffect, useRef} from "react";
import {usePlayer} from "./Player";
import {useState} from "react";
import className from 'classnames';
import {
    useWindowSize,
} from '@react-hook/window-size'
import { useRafLoop, useUpdate } from 'react-use';
import useComponentSize from '@rehooks/component-size'

export const TooltipMenu = () => {
    const {tooltip: {activeTooltip}} = usePlayer()
    const [tooltipList, setTooltipList] = useState([
        {
            "name": "fullscreen",
            "state": false,
            "text": "Во весь экран",
            style: {
                right: '16px'
            }
        },
        {
            "name": "forwardreplay",
            "state": false,
            "text": "На 10 секунд назад"
        },
        {
            "name": "playpause",
            "state": false,
            "text": "Воспроизвести"
        },
        {
            "name": "volume",
            "state": false,
            "text": "Отключение звука"
        },
        {
            "name": "forwardreplayforward",
            "state": false,
            "text": "На 10 секунд вперед",
            style: {
                left: '15%'
            }
        },
        {
            "name": "forwardreplayreplay",
            "state": false,
            "text": "На 10 секунд назад",
            style: {
                left: '10%'
            }
        }
    ]);
    const {name = '', state = false, text = '', ref = null} = activeTooltip;

    useEffect(() => {
        setTooltipList(prev => {
            const index = prev.findIndex(t => t.name === activeTooltip.name);
            if (index !== -1) {
                return prev.map((_, i) => {
                    if (i === index) {
                        return {..._, ...activeTooltip}
                    }
                    return _
                } )
            }
            return [...prev, activeTooltip]
        })
    }, [activeTooltip])


    return (
        <div className={'video-react__tooltip-wrapper'}>
            {tooltipList.filter(t => t.name).map((t) => <Tooltip {...t}/>)}
        </div>
    )
}

const Tooltip = ({name, state, text, style, target}) => {
    const [offsetLeft, setOffsetLeft] = useState();
    const [_style, setStyle] = useState(style);
    let ref = useRef(null)
    let size = useComponentSize(ref)
    // size == { width: 100, height: 200 }
    const componentWidth = useRef(null)

    useEffect(() => {
        componentWidth.current = size.width
    }, [size.width])

    const [loopStop, loopStart, isActive] = useRafLoop((time) => {
        if (target && target.current && componentWidth.current) {
            setStyle(prev => {
                return {...prev, left: target.current.offsetLeft - componentWidth.current / 2 + 25}
            })
        }
    });

    useEffect(() => {
        if (target && target.current) {
            loopStart()
            return () => loopStop()
        }
    }, [target])

    return (
        <div ref={ref} style={_style} className={className('video-react__tooltip', {'video-react__tooltip_hide': state === false})}>
            {text}
        </div>
    )
}
