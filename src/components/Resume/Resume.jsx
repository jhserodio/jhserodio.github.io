import React from 'react';
import { useIntl } from 'react-intl';
import style from './Resume.module.css';

const Resume = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={style.Resume}>
      <div className={style.card}>
        <h3 className={style.subtitle}>
          {formatMessage({
            id: 'resume.analyse.title',
          })}
        </h3>
        <p className={style.text}>
          {formatMessage({
            id: 'resume.analyse.description',
          })}
        </p>
      </div>

      <div className={style.card}>
        <h3 className={style.subtitle}>
          {formatMessage({
            id: 'resume.architecture.title',
          })}
        </h3>
        <p className={style.text}>
          {formatMessage({
            id: 'resume.architecture.description',
          })}
        </p>
      </div>

      <div className={style.card}>
        <h3 className={style.subtitle}>
          {formatMessage({
            id: 'resume.development.title',
          })}
        </h3>
        <p className={style.text}>
          {formatMessage({
            id: 'resume.development.description',
          })}
        </p>
      </div>
    </div>
  );
};

export { Resume };
