import React from 'react'
import PropTypes from 'prop-types'
import { StaticQuery, graphql } from 'gatsby'

import Header from './header'
import './layout.css'

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query SiteTitleQuery {
        site {
          siteMetadata {
            title
            subTitle
          }
        }
        allFile {
          edges {
            node {
              relativePath
              prettySize
              extension
              birthTime(fromNow: true)
            }
          }
        }
      }
    `}
    render={data => (
        <>
        <Header siteTitle={data.site.siteMetadata.title}
                subTitle={data.site.siteMetadata.subTitle}/>
        <div
          style={{
            margin: '0 auto',
            maxWidth: 960,
            padding: '0px 1.0875rem 1.45rem',
            paddingTop: 0,
            color: '#333'
          }}
        >
          {children}
          <footer>
              <div id="rmOrganism">
                <div class="rmEmbed rmLayout--horizontal rmBase">
                  <div data-page-type="formSubscribe" class="rmBase__body rmSubscription">
                    <form method="post" action="https://t0fdd8682.emailsys1a.net/183/4643/ac1ee732af/subscribe/form.html?_g=1651790792" class="rmBase__content">
                      <div class="rmBase__container">
                        <div class="rmBase__section">
                          <div class="rmBase__el rmBase__el--input rmBase__el--label-pos-none" data-field="email">
                            <label for="email" class="rmBase__compLabel rmBase__compLabel--hideable">
                              Email
                            </label>
                            <div class="rmBase__compContainer">
                              <input type="text" name="email" id="email" placeholder="Email" value="" class="rmBase__comp--input comp__input">
                              <div class="rmBase__compError"></div>
                            </div>
                          </div>
                          <div class="rmBase__el rmBase__el--cta">
                            <button type="submit" class="rmBase__comp--cta">
                              Subscribe
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </div>
                  <div data-page-type="pageSubscribeSuccess" class="rmBase__body rmSubscription hidden">
                    <div class="rmBase__content">
                      <div class="rmBase__container">
                        <div class="rmBase__section">
                          <div class="rmBase__el rmBase__el--heading">
                            <div class="rmBase__comp--heading">
                              Vielen Dank für Ihre Anmeldung!
                  <!-- this linebreak is important, don't remove it! this will force trailing linebreaks to be displayed -->
                              <br>
                            </div>
                          </div>
                        </div>
                        <div class="rmBase__section">
                          <div class="rmBase__el rmBase__el--text">
                            <div class="rmBase__comp--text">
                              Wir haben Ihnen auch schon die erste E-Mail geschickt und bitten Sie, Ihre E-Mail-Adresse über den Aktivierungslink zu bestätigen.
                  <!-- this linebreak is important, don't remove it! this will force trailing linebreaks to be displayed -->
                              <br>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <style>
                      .rmBody.rmBody--embed {
                      background: transparent;
                  }
                  #rmOrganism .rmBase {
                      background: transparent;
                      color: #343434;
                      font-family: Arial, Helvetica, sans-serif;
                  }
                  #rmOrganism .rmBase__comp--textlink {
                      color: #0000ee;
                  }
                  #rmOrganism .rmBase__comp--link {
                      color: #0000ee;
                  }
                  #rmOrganism .rmBase__comp--button {
                      background: #0000ee;
                      border: 0px solid #1CCC71;
                      border-radius: 5px;
                      color: #ffffff;
                  }
                  #rmOrganism .rmBase__comp--cta {
                      background: #0000ee;
                      border: 0px solid #1CCC71;
                      border-radius: 5px;
                      color: #ffffff;
                  }
                  #rmOrganism .rmBase__compError {
                      color: #FFFFFF;
                      background-color: #FF0000;
                  }
                      #rmOrganism .rmSubscription {
                      background: transparent;
                      color: #343434;
                      font-family: Arial, Helvetica, sans-serif;
                  }
                  #rmOrganism .rmSubscription .rmBase__el {
                      font-size: 16px;
                      margin-bottom: 1em;
                  }
                  #rmOrganism .rmSubscription .rmBase__el--logo {
                      text-align: center;
                  }
                  #rmOrganism .rmSubscription .rmBase__el--heading {
                      margin-bottom: 0px;
                      text-align: center;
                  }
                  #rmOrganism .rmSubscription .rmBase__el--text {
                      margin-bottom: 28px;
                      text-align: center;
                  }
                  #rmOrganism .rmSubscription .rmBase__el--link {
                      text-align: center;
                  }
                  #rmOrganism .rmSubscription .rmBase__el--captcha {
                      text-align: center;
                  }
                  #rmOrganism .rmSubscription .rmBase__el--cta {
                      align-items: stretch
                  }
                  #rmOrganism .rmSubscription .rmBase__el--legal-notice {
                      text-align: center;
                  }
                  #rmOrganism .rmSubscription .rmBase__comp--heading {
                      color: #f4921e;
                      font-size: 36px;
                      line-height: 45px;
                  }
                  #rmOrganism .rmSubscription .rmBase__comp--text {
                      font-size: 16px;
                      line-height: 24px;
                  }
                  #rmOrganism .rmSubscription .rmBase__compLabel {
                      color: #C9CED4;
                  }
                  #rmOrganism .rmSubscription .rmBase__comp--cta {
                      font-size: 16px;
                  }
                  #rmOrganism .rmPopup__close {
                      font-family: Arial, Helvetica, sans-serif;
                  }
                  #rmOrganism .rmPopup__backdrop {
                      background: #303233;
                      opacity: 0.6;
                  }
                      #rmOrganism .rmPage {
                      background: transparent;
                      color: #343434;
                      font-family: Arial, Helvetica, sans-serif;
                  }
                  #rmOrganism .rmPage .rmBase__comp--heading {
                      color: #f4921e;
                  }
                  #rmOrganism .rmPage .rmBase__compLabel {
                      color: #343434;
                  }
                  .rmBody{margin:0;padding:0}#rmOrganism{box-sizing:border-box}#rmOrganism *{color:currentColor;border:0;font-size:100%;font:inherit;margin:0;outline:none;padding:0;vertical-align:baseline}#rmOrganism *,#rmOrganism :after,#rmOrganism :before{box-sizing:inherit}#rmOrganism button::-moz-focus-inner,#rmOrganism input::-moz-focus-inner{border:0;padding:0}#rmOrganism input[type=email],#rmOrganism input[type=password],#rmOrganism input[type=text],#rmOrganism textarea{-webkit-appearance:none}#rmOrganism .hidden{display:none!important}#rmOrganism .rmPopup__container{bottom:0;display:none;left:0;overflow:hidden;pointer-events:none;position:fixed;right:0;top:0;z-index:1000}#rmOrganism .rmPopup__container.rmPopup--show{display:flex}#rmOrganism .rmPopup__container .rmPopup__backdrop{display:block;height:100%;left:0;pointer-events:auto;position:absolute;top:0;width:100%}#rmOrganism .rmPopup__container .rmPopup{overflow:hidden;pointer-events:auto}#rmOrganism .rmPopup__container .rmPopup .rmPopup__close{align-items:center;background:rgba(0,0,0,.6);border-radius:100%;color:#fff;cursor:pointer;display:flex;flex-direction:column;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;height:1.6em;justify-content:center;line-height:1;position:absolute;right:2px;text-align:center;top:2px;width:1.6em;z-index:100}#rmOrganism .rmPopup__container .rmPopup.rmPopup--modal{border-radius:1em 1em 0 0;max-height:90%;overflow:hidden;position:absolute;bottom:0;left:50%;transform:translate(-50%);width:98%}@media screen and (min-width:768px){#rmOrganism .rmPopup__container .rmPopup.rmPopup--modal{border-radius:1em;box-shadow:0 0 1em rgba(0,0,0,.25);bottom:auto;top:5%;width:calc(100% - 2em)}}#rmOrganism .rmPopup__container .rmPopup.rmPopup--sidebar{border-radius:1em 0 0 0;box-shadow:0 0 1em rgba(0,0,0,.25);max-height:calc(100% - 1em);overflow:hidden;position:absolute;right:0;bottom:0;width:calc(100% - 1em)}#rmOrganism .rmPopup__container .rmPopup.rmPopup--banner{box-shadow:0 0 1em rgba(0,0,0,.15);overflow:hidden;position:absolute;left:0;width:100%}#rmOrganism .rmPopup__container .rmPopup.rmPopup--banner.rmLayout--banner-top{top:0}#rmOrganism .rmPopup__container .rmPopup.rmPopup--banner.rmLayout--banner-bottom{bottom:0}#rmOrganism .rmBase__el .comp__input,#rmOrganism .rmBase__el .comp__select{background:#fff;border:none;border-radius:.25em;box-shadow:inset 0 2px 1px rgba(0,0,0,.05),inset 0 0 0 1px rgba(0,0,0,.2);color:#666;font-family:inherit;font-size:1em;font-weight:400;height:2.5em;line-height:1.5;margin:0;outline:none;padding:.5em;vertical-align:top;width:100%}#rmOrganism .rmBase__el .comp__input:focus,#rmOrganism .rmBase__el .comp__select:focus{box-shadow:inset 0 2px 1px rgba(0,0,0,.05),inset 0 0 0 1px rgba(0,0,0,.5);color:#666;outline:none}#rmOrganism .rmBase__el .comp__input::placeholder{color:currentColor!important;opacity:1!important}#rmOrganism .rmBase__el.rmBase__el--has-error .rmBase__compError{display:inline-block}#rmOrganism .rmBase__el--title .rmBase__comp--titleInput{margin-top:1em}#rmOrganism .rmBase__el--image{margin:0!important}#rmOrganism .rmBase__comp--image{background:no-repeat 50%;height:100%;position:relative;width:100%}#rmOrganism .rmBase__comp--image.image--fit{background-size:cover}#rmOrganism .rmBase__comp--image .image__link{display:block;height:100%;width:100%}#rmOrganism .rmBase__comp--logo{border:none;display:inline-block;height:auto;max-width:100%;vertical-align:top}#rmOrganism .rmBase__comp--logolink{display:inline-block}#rmOrganism .rmBase__comp--cta{cursor:pointer;display:inline-block;font-family:inherit;line-height:1.5;font-weight:700;text-align:center;padding:.5em 1.5em}#rmOrganism .rmBase__comp--button,#rmOrganism .rmBase__comp--link{cursor:pointer;display:inline-block;line-height:1.5;text-decoration:none}#rmOrganism .rmBase__comp--link{font-weight:400;padding:.5em 0}#rmOrganism .rmBase__comp--link:hover{text-decoration:underline}#rmOrganism .rmBase__comp--button{font-weight:700;padding:.5em 1em}#rmOrganism .rmBase__comp--textlink{cursor:pointer;font-weight:400;text-decoration:none}#rmOrganism .rmBase__comp--textlink:hover{text-decoration:underline}#rmOrganism .rmBase__comp--captcha{display:inline-block;max-width:100%;overflow:hidden;text-align:left;vertical-align:top}#rmOrganism .rmBase__comp--coupon{border:2px dashed;display:inline-block;line-height:1.5;padding:.75em 2.25em}#rmOrganism .rmBase__comp--birthday{display:flex}#rmOrganism .rmBase__comp--birthday .comp__select{flex-grow:1;min-width:1%}#rmOrganism .rmBase__comp--birthday .comp__select:not(:first-child){margin-left:1em}#rmOrganism .rmBase__comp--privacy{align-items:center;display:flex}#rmOrganism .rmBase__comp--privacy .privacy__visual{flex-shrink:0;font-size:16px;height:4em;margin-right:1em;width:4em}#rmOrganism .rmBase__comp--privacy .privacy__text{font-size:11px;line-height:1.4;text-align:left}#rmOrganism .rmBase__comp--privacy .privacy__text a{color:currentColor;text-decoration:underline}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox,#rmOrganism .rmBase__comp--radio .vFormCheckbox{align-items:flex-start;display:inline-flex}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox .vFormCheckbox__indicator,#rmOrganism .rmBase__comp--radio .vFormCheckbox .vFormCheckbox__indicator{background:#fff;border:1px solid #ccc;border-radius:.125em;color:#666;cursor:pointer;display:inline-block;flex-shrink:0;font-size:1.25em;height:1em;line-height:0;position:relative;vertical-align:top;width:1em}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox .vFormCheckbox__input,#rmOrganism .rmBase__comp--radio .vFormCheckbox .vFormCheckbox__input{display:none;left:0;opacity:0;position:absolute;top:0}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox .vFormCheckbox__input:checked~.vFormCheckbox__indicator:after,#rmOrganism .rmBase__comp--radio .vFormCheckbox .vFormCheckbox__input:checked~.vFormCheckbox__indicator:after{background:url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' width='10' height='10'%3E%3Cpath fill='%23333' d='M19.4 2.6c-.8-.8-2-.8-2.8 0L6.4 12.8l-3-3.1c-.8-.8-2-.8-2.8 0-.8.8-.8 2 0 2.8L5.1 17c.8.8 2 .8 2.8 0l1.4-1.4L19.4 5.4c.8-.8.8-2 0-2.8z'/%3E%3C/svg%3E") no-repeat 50%;content:"";display:block;height:.75em;left:50%;margin:-.375em 0 0 -.375em;position:absolute;top:50%;width:.75em}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox .vFormCheckbox__label,#rmOrganism .rmBase__comp--radio .vFormCheckbox .vFormCheckbox__label{font-size:1em;line-height:1.25;margin:0}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox .vFormCheckbox__indicator~.vFormCheckbox__label,#rmOrganism .rmBase__comp--radio .vFormCheckbox .vFormCheckbox__indicator~.vFormCheckbox__label{margin:0 0 0 .75em}#rmOrganism .rmBase__comp--checkbox .vFormCheckbox:hover .vFormCheckbox__indicator,#rmOrganism .rmBase__comp--radio .vFormCheckbox:hover .vFormCheckbox__indicator{border-color:#666}#rmOrganism .rmBase__comp--checkbox{font-size:1em;line-height:1.25}#rmOrganism .rmBase__comp--radio{padding-top:.625em}#rmOrganism .rmBase__comp--radio .vFormRadio__group--inline,#rmOrganism .rmBase__comp--radio .vFormRadio__group--stacked{display:inline-flex;flex-direction:row;flex-wrap:wrap}#rmOrganism .rmBase__comp--radio .vFormRadio__group--stacked{flex-direction:column}#rmOrganism .rmBase__comp--radio .vFormRadio{align-items:flex-start;display:inline-flex;vertical-align:top}#rmOrganism .rmBase__comp--radio .vFormRadio .vFormRadio__indicator{background:#fff;border:1px solid #ccc;border-radius:100%;color:#666;cursor:pointer;display:inline-block;flex-shrink:0;font-size:1.25em;height:1em;position:relative;vertical-align:top;width:1em}#rmOrganism .rmBase__comp--radio .vFormRadio .vFormRadio__input{display:none;left:0;opacity:0;position:absolute;top:0}#rmOrganism .rmBase__comp--radio .vFormRadio .vFormRadio__input:checked~.vFormRadio__indicator:after{background:currentColor;border-radius:100%;content:"";display:block;height:.5em;left:50%;margin:-.25em 0 0 -.25em;position:absolute;top:50%;width:.5em}#rmOrganism .rmBase__comp--radio .vFormRadio .vFormRadio__label{font-size:1em;line-height:1.25;margin:0 0 0 .75em}#rmOrganism .rmBase__comp--radio .vFormRadio:hover .vFormRadio__indicator{border-color:#666}#rmOrganism .rmBase__comp--radio .vFormRadio--inline{display:inline-flex}#rmOrganism .rmBase__comp--radio .vFormRadio--inline:not(:first-child){margin-left:1em}#rmOrganism .rmBase__comp--radio .vFormRadio--stacked{display:flex}#rmOrganism .rmBase__comp--radio .vFormRadio--stacked:not(:first-child){margin-top:.5em}#rmOrganism .rmBase__compError{border-radius:3px;display:none;font-size:12px;font-weight:700;line-height:1.5;margin-top:2px;padding:1px 5px}#rmOrganism .rmBase__compError--radio{margin-top:.5em}#rmOrganism .rmBase__comp--legal-noticeDivider{background:currentColor;border:none;color:inherit;display:inline-block;font-size:1em;height:2px;line-height:0;margin-bottom:1em;opacity:.25;overflow:hidden;width:10em}#rmOrganism .rmBase__comp--legal-notice{font-size:11px;line-height:1.4}@media screen and (min-width:480px){#rmOrganism .rmSubscription .rmBase__el.rmBase__el--label-pos-left{display:flex}#rmOrganism .rmSubscription .rmBase__el.rmBase__el--label-pos-left .rmBase__compLabel{flex-basis:30%;flex-shrink:0;hyphens:auto;margin:0;max-width:30%;padding:.625em .5em 0 0}#rmOrganism .rmSubscription .rmBase__el.rmBase__el--label-pos-left .rmBase__compContainer{flex-grow:1}}#rmOrganism .rmLayout--vertical.rmBase{display:flex;flex-direction:column;max-width:480px}@media screen and (min-width:768px){#rmOrganism .rmLayout--vertical.rmBase .rmBase__container{padding:2em}}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-top .rmBase__el--image{flex-shrink:0;height:100px}@media screen and (min-width:768px){#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-top .rmBase__el--image{height:140px}}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-right{max-width:640px}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-right .rmBase__el--image{flex-shrink:0;height:100px}@media screen and (min-width:768px){#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-right .rmBase__body{flex-direction:row}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-right .rmBase__el--image{flex-basis:0px;flex-grow:1;height:auto;order:10}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-right .rmBase__content{flex-basis:80%;flex-grow:1;flex-shrink:0;max-width:400px}}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-bottom .rmBase__el--image{flex-shrink:0;height:100px;order:10}@media screen and (min-width:768px){#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-bottom .rmBase__el--image{height:140px}}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-left{max-width:640px}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-left .rmBase__el--image{flex-shrink:0;height:100px}@media screen and (min-width:768px){#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-left .rmBase__body{flex-direction:row}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-left .rmBase__el--image{flex-basis:0px;flex-grow:1;height:auto}#rmOrganism .rmLayout--vertical.rmBase.rmLayout--vertical-image-left .rmBase__content{flex-basis:80%;flex-grow:1;flex-shrink:0;max-width:400px}}#rmOrganism .rmLayout--horizontal.rmBase{display:flex;flex-direction:column;max-width:640px}@media screen and (min-width:768px){#rmOrganism .rmLayout--horizontal.rmBase .rmBase__container{padding:2em}#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section{display:flex;flex-direction:row}#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section .rmBase__el{flex-basis:0px;flex-grow:1;margin-right:1em}#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section .rmBase__el:last-child{margin-right:0}#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section .rmBase__el--cta:not(:only-child),#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section .rmBase__el--link:not(:only-child){align-self:flex-end;flex-basis:auto;flex-grow:0;flex-shrink:0}#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section .rmBase__el--label-pos-top~.rmBase__el--cta:not(:only-child),#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section .rmBase__el--label-pos-top~.rmBase__el--link:not(:only-child){align-self:flex-end}#rmOrganism .rmLayout--horizontal.rmBase .rmBase__section:last-child .rmBase__el{margin-bottom:0}}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-right{max-width:800px}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-right .rmBase__el--image{flex-shrink:0;height:100px}@media screen and (min-width:768px){#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-right .rmBase__body{flex-direction:row}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-right .rmBase__el--image{flex-basis:0px;flex-grow:1;height:auto;order:10}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-right .rmBase__content{flex-basis:90%;flex-grow:1;flex-shrink:0;max-width:640px}}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-left{max-width:800px}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-left .rmBase__el--image{flex-shrink:0;height:100px}@media screen and (min-width:768px){#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-left .rmBase__body{flex-direction:row}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-left .rmBase__el--image{flex-basis:0px;flex-grow:1;height:auto}#rmOrganism .rmLayout--horizontal.rmBase.rmLayout--horizontal-image-left .rmBase__content{flex-basis:90%;flex-grow:1;flex-shrink:0;max-width:640px}}@media screen and (min-width:768px){#rmOrganism .rmLayout--banner.rmBase{display:flex;flex-direction:column}#rmOrganism .rmLayout--banner.rmBase .rmBase__content{margin:0 auto;max-width:1200px;width:100%}#rmOrganism .rmLayout--banner.rmBase .rmBase__container{padding:1em 2em}#rmOrganism .rmLayout--banner.rmBase .rmBase__section{display:flex;flex-direction:row;min-width:480px}#rmOrganism .rmLayout--banner.rmBase .rmBase__section .rmBase__el{flex-basis:0px;flex-grow:1;margin-right:1em}#rmOrganism .rmLayout--banner.rmBase .rmBase__section .rmBase__el:last-child{margin-right:0}#rmOrganism .rmLayout--banner.rmBase .rmBase__section .rmBase__el--cta:not(:only-child),#rmOrganism .rmLayout--banner.rmBase .rmBase__section .rmBase__el--link:not(:only-child){flex-basis:auto;flex-grow:0;flex-shrink:0}#rmOrganism .rmLayout--banner.rmBase .rmBase__section .rmBase__el--label-pos-top~.rmBase__el--cta:not(:only-child),#rmOrganism .rmLayout--banner.rmBase .rmBase__section .rmBase__el--label-pos-top~.rmBase__el--link:not(:only-child){align-self:flex-end}#rmOrganism .rmLayout--banner.rmBase .rmBase__section:last-child .rmBase__el{margin-bottom:0}}#rmOrganism .rmSubscription.rmBase__body{display:flex;flex-direction:column;overflow:hidden}#rmOrganism .rmSubscription .rmBase__content{-webkit-overflow-scrolling:touch;box-sizing:border-box;margin:0;overflow:auto}#rmOrganism .rmSubscription .rmBase__container{padding:2em 1em}#rmOrganism .rmSubscription .rmBase__el .rmBase__compLabel{display:block;line-height:1.25;margin:0 0 .25em;max-width:99%;overflow:hidden;text-overflow:ellipsis;vertical-align:top;white-space:nowrap}#rmOrganism .rmSubscription .rmBase__el.rmBase__el--label-pos-none .rmBase__compLabel.rmBase__compLabel--hideable{display:none}#rmOrganism .rmSubscription .rmBase__el.rmBase__el--cta{display:flex;flex-direction:column}#rmOrganism .rmSubscription .rmBase__section:last-child .rmBase__el:last-child{margin-bottom:0}.rmBody.rmBody--subscription.rmBody--popup{background:#e9edf2}.rmBody.rmBody--subscription.rmBody--embed #rmOrganism .rmBase{margin:0 auto}#rmOrganism .rmPage{font-size:16px}#rmOrganism .rmPage .rmBase__container{margin:0 auto;max-width:44em;padding:2em 1em}@media screen and (min-width:768px){#rmOrganism .rmPage .rmBase__container{padding:2em}}#rmOrganism .rmPage .rmBase__comp--heading{font-size:2em;line-height:1.25}#rmOrganism .rmPage .rmBase__compLabel{display:block;line-height:1.25;margin:0 0 .25em;max-width:99%;overflow:hidden;text-overflow:ellipsis;vertical-align:top;white-space:nowrap}#rmOrganism .rmPage .rmBase__el{font-size:1em;line-height:1.4;margin-bottom:1em}#rmOrganism .rmPage .rmBase__el--logo{margin:0 0 3em}#rmOrganism .rmPage .rmBase__el--coupon,#rmOrganism .rmPage .rmBase__el--cta,#rmOrganism .rmPage .rmBase__el--unsubscribe-reason{margin:3em 0}#rmOrganism .rmPage .rmBase__el--coupon .rmBase__compLabel,#rmOrganism .rmPage .rmBase__el--unsubscribe-reason .rmBase__compLabel{margin:0 0 .5em;max-width:100%;overflow:visible;text-overflow:unset;white-space:normal}#rmOrganism .rmPage .rmBase__el--unsubscribe-reason{text-align:left}#rmOrganism .rmPage .rmBase__el--legal-notice{margin-top:3rem;text-align:left}#rmOrganism .rmPage .rmBase__section:last-child .rmBase__el:last-child{margin-bottom:0}#rmOrganism .rmLayout--page-centered .rmPage .rmBase__container,#rmOrganism .rmLayout--page-centered .rmPage .rmBase__container .rmBase__el--legal-notice{text-align:center}#rmOrganism .rmLayout--legacy .rmBase__el .comp__input,#rmOrganism .rmLayout--legacy .rmBase__el .comp__select{border-radius:0;height:2em;padding:.25em .5em}@media screen and (min-width:360px){#rmOrganism .rmLayout--legacy .rmSubscription .rmBase__el.rmBase__el--label-pos-left{display:flex}#rmOrganism .rmLayout--legacy .rmSubscription .rmBase__el.rmBase__el--label-pos-left .rmBase__compLabel{flex-basis:140px;flex-shrink:0;hyphens:auto;margin:0;max-width:140px;padding:.375em .5em 0 0}#rmOrganism .rmLayout--legacy .rmSubscription .rmBase__el.rmBase__el--label-pos-left .rmBase__compContainer{flex-grow:1}}#rmOrganism .rmLayout--legacy.rmBase{display:flex;flex-direction:column;max-width:400px}#rmOrganism .rmLayout--legacy.rmBase .rmBase__container{padding:10px}.rmBody.rmBody--subscription.rmBody--legacy{background:transparent}.rmBody.rmBody--subscription.rmBody--legacy.rmBody--embed #rmOrganism .rmBase{margin:0 auto 0 0}
              </style>
              <script src="https://t0fdd8682.emailsys1a.net/form/183/5109/df45f7e7cc/embedded.js" async></script>
              © {new Date().getFullYear()} Matthias Nehlsen
          </footer>
        </div>
      </>
    )}
  />
)

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
