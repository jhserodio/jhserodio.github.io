import { useIntl } from '../../../../context/useInlt';
import style from './about.module.css'

export const About = ({ bio = false }) => {
  const t = useIntl();

  return (
    <div className={style.about}>
      {bio && <div className={style.bio}>
        <h2 className='title'>{t('me.about.title')}</h2>
        <p>{t('me.about.bio')}</p>
      </div>}


      <div className={style.eductation}>
        <h2 className='title'>{t('me.education.title')}</h2>
        <ul>
          <li>{t('me.education.bachelor')}</li>
          <li>{t('me.education.current')}</li>
        </ul>
      </div>

      <div className={style.contacts}>
        <h2 className='title'>{t('me.contact.title')}</h2>
        <ul className={style.list}>
          <li className={style.item}>
            <div className={style.print}>
              <strong>
                {t('me.contact.email.label')}
              </strong>
              <a href={`mailto:${t('me.contact.email.value')}`}>
                {t('me.contact.email.value')}
              </a>
            </div>

            
              <a  className={style.screen} href={`mailto:${t('me.contact.email.value')}`}>
                {t('me.contact.email.value')}
              </a>
            
          </li>
          <li className={style.item}>
            <div className={style.print}>
              <strong>
                {t('me.contact.numberPhone.label')}
              </strong>
              <a href={`tel:${t('me.contact.numberPhone.value')}`}>
                {t('me.contact.numberPhone.value')}
              </a>
            </div>

            
              <a  className={style.screen} href={`tel:${t('me.contact.numberPhone.value')}`}>
                {t('me.contact.numberPhone.value')}
              </a>
            
          </li>
          <li className={style.item}>
            <div className={style.print}>
                <strong>
                  {t('me.contact.github.label')}
                </strong>
                <a href={t('me.contact.github.value')} target="_blank">
                  {t('me.contact.github.value')}
                </a>
            </div>

            
              <a  className={style.screen} href={t('me.contact.github.value')} target="_blank">
                {t('me.contact.github.label')}
              </a>
            
          </li>
          <li className={style.item}>
            <div className={style.print}>
                <strong>
                  {t('me.contact.linkedin.label')}
                </strong>
                <a href={t('me.contact.linkedin.value')} target="_blank">
                  {t('me.contact.linkedin.value')}
                </a>
            </div>

            
              <a  className={style.screen} href={t('me.contact.linkedin.value')} target="_blank">
                {t('me.contact.linkedin.label')}
              </a>
            
          </li>
          <li className={style.item}>
            <div className={style.print}>
                <strong>
                  {t('me.contact.leetcode.label')}
                </strong>
                <a href={t('me.contact.leetcode.value')} target="_blank">
                  {t('me.contact.leetcode.value')}
                </a>
            </div>

            
              <a  className={style.screen} href={t('me.contact.leetcode.value')} target="_blank">
                {t('me.contact.leetcode.label')}
              </a>
            
          </li>

        </ul>
      </div>

    </div>
  )
}
