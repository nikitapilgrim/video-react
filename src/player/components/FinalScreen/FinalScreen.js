import React, {useEffect, useMemo, useRef, useState} from 'react';
import { IconAgain } from '../../icons/Again';
import classNames from 'classnames';
import {usePlayer} from "../../components/Player";

export const FinalScreen = ({ player, actions, manager}) => {
  const handleClickAgain = () => {
    actions.seek(0);
    actions.play();
  };
  const final = useMemo(() => {
    return (
      Number(player.duration) &&
      player.duration > 0 &&
      player.duration === player.currentTime
    );
  }, [player]);
  const prevSeek = useRef(null);

/*

  useEffect(() => {
    if (final && prevSeek.current) {
      actions.play();
    }
    prevSeek.current = player.seeking;
  }, [final, player.seeking])
*/



  return (
    <div
      className={classNames('video-react-final-screen', {
        'video-react-final-screen-show': final,
      })}
    >
      <div className="video-react-final-screen__title">Урок завершен</div>
      <div className="video-react-final-screen__descr">
        Запустите следующий урок,
        <br /> используя оглавление.
      </div>
      <button
        onClick={handleClickAgain}
        className="video-react-final-screen__button"
      >
        <IconAgain /> Посмотреть урок еще раз
      </button>
    </div>
  );
};
