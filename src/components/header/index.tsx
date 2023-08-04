import { Container } from "../container";

import style from './header.module.css'
import profile from '../../assets/profile.jpeg'

export const Header = () => (
  <header className={style.header}>
    <Container>
      <div>
        <div className={style.background} />
        <div className={style.content}>
          <picture className={style.picture}>
            <img src={profile.src} alt='João Henrique Serodio' />
          </picture>
        </div>
      </div>
    </Container>
  </header>
)