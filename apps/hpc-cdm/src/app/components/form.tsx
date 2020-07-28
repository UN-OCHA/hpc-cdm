import React, { useEffect, useState } from 'react';
import { Form } from 'enketo-core';
import $ from 'jquery';
import { combineClasses, styled } from '@unocha/hpc-ui';
import env from '../../environments/environment';

const CLS = {
  ENKETO: 'enketo',
  XCONTAINER_PAGES: 'xcontainer pages',
  MODE: {
    editable: 'style-editable',
    readonly: 'style-readonly',
  },
};

interface Props {
  id: string;
  mode?: string;
  submissionId?: string;
  className?: string;
}

const findCurrentElement = (elem: JQuery, name: string, childMatcher: any) => {
  return childMatcher ? elem.find(childMatcher(name)) : elem.children(name);
};

const bindJsonToXml = (elem: JQuery, data: any, childMatcher: any) => {
  Object.keys(data)
    .map((key) => [key, data[key]])
    .forEach(([id, value]) => {
      const current = findCurrentElement(elem, id, childMatcher);
      if (typeof value === 'object') {
        if (current.children().length) {
          bindJsonToXml(current, value, null);
        } else {
          current.text(value._id);
        }
      } else {
        current.text(value);
      }
    });
};

const bindDataToModel = (model: string, data: any) => {
  const xml = $($.parseXML(model));
  const root = xml.find('model instance').children().first();
  if (data) {
    bindJsonToXml(root, data, (name: string) =>
      '>%, >inputs>%'.replace(/%/g, name)
    );
  }
  return new XMLSerializer().serializeToString(root[0]);
};

class EnketoForm {
  private form: Form;

  constructor(html: any, modelStr: any, content: any) {
    $('.xcontainer').replaceWith(html);

    const formElement = $('#xform').find('form').first()[0];
    console.log(formElement);
    this.form = new Form(formElement, {
      modelStr,
      instanceStr: bindDataToModel(modelStr, content),
      external: undefined,
    });
    const errors = this.form.init();
    if (errors && errors.length) {
      console.error('Form Errors', JSON.stringify(errors));
    }
  }

  getData() {
    return this.form.getDataStr({ irrelevant: false });
  }
}

const Component = (props: Props) => {
  const { id, className } = props;
  const [eform, setEform] = useState({});

  const xhtml = (form: {}) => {
    const html = $(form);
    // const that = this;
    for (const selector of ['.question-label', '.question > .or-hint']) {
      $(selector, html).each(function (idx) {
        const text = $(this).text().replace(/\n/g, '<br />');
        // TODO markdown
        // $(this).html(that.md.compile(text));
        $(this).html(text);
      });
    }
    return html;
  };

  const handleSubmit = () => {
    console.log('Submitted............');
    const data = eform.getData();
    console.log(data);
    // TODO submit data
  };

  useEffect(() => {
    env.model.forms.getForm(parseInt(id)).then((data) => {
      const { form, model } = data;
      setEform(new EnketoForm(xhtml(form), model, null));
    });
  }, [id]);

  return (
    <div className={combineClasses(className)} id="xform">
      <div className="main">
        <div className={CLS.XCONTAINER_PAGES}></div>
        <section className="form-footer end">
          <div className="form-footer__content">
            <div className="form-footer__content__main-controls">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="btn btn-primary"
                id="submit-form"
              >
                <i className="icon icon-check"> </i>Submit
              </button>
              <button className="btn btn-default previous-page disabled">
                Prev
              </button>
              <button className="btn btn-primary next-page disabled">
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default styled(Component)`
  border: 2px solid #666;
  padding: 1em;
  min-height: 90vh !important;

  @font-face {
    font-family: 'FontAwesome';
    src: url('assets/fonts/fontawesome-webfont.woff?v=4.6.2') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  h3#form-title {
    color: #026cb6 !important;
    border-bottom: none !important;
    margin: 0.5em 0 -1em 0 !important;
  }

  .previous-page {
    padding: 1em 0 2em 0 !important;
  }

  .fa,
  .icon,
  .android-chrome,
  .record-list__records__record[data-draft='true']::before,
  .enketo-geopoint-marker,
  .glyphicon-chevron-up,
  .glyphicon-chevron-down {
    display: inline-block;
    font: normal normal normal 14px/1 FontAwesome;
    font-size: inherit;
    text-rendering: auto;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .fa-lg {
    font-size: 1.3333333333em;
    line-height: 0.75em;
    vertical-align: -15%;
  }

  .fa-2x {
    font-size: 2em;
  }

  .fa-3x {
    font-size: 3em;
  }

  .fa-4x {
    font-size: 4em;
  }

  .fa-5x {
    font-size: 5em;
  }

  .fa-fw {
    width: 1.2857142857em;
    text-align: center;
  }

  .fa-ul {
    padding-left: 0;
    margin-left: 2.1428571429em;
    list-style-type: none;
  }
  .fa-ul > li {
    position: relative;
  }

  .fa-li {
    position: absolute;
    left: -2.1428571429em;
    width: 2.1428571429em;
    top: 0.1428571429em;
    text-align: center;
  }
  .fa-li.fa-lg {
    left: -1.8571428571em;
  }

  .fa-border {
    padding: 0.2em 0.25em 0.15em;
    border: solid 0.08em #eee;
    border-radius: 0.1em;
  }

  .fa-pull-left {
    float: left;
  }

  .fa-pull-right {
    float: right;
  }

  .fa.fa-pull-left,
  .fa-pull-left.icon,
  .fa-pull-left.android-chrome,
  .fa-pull-left.record-list__records__record[data-draft='true']::before,
  .fa-pull-left.enketo-geopoint-marker,
  .fa-pull-left.glyphicon-chevron-up,
  .fa-pull-left.glyphicon-chevron-down {
    margin-right: 0.3em;
  }

  .fa.fa-pull-right,
  .fa-pull-right.icon,
  .fa-pull-right.android-chrome,
  .fa-pull-right.record-list__records__record[data-draft='true']::before,
  .fa-pull-right.enketo-geopoint-marker,
  .fa-pull-right.glyphicon-chevron-up,
  .fa-pull-right.glyphicon-chevron-down {
    margin-left: 0.3em;
  }

  .pull-right {
    float: right;
  }

  .pull-left {
    float: left;
  }

  .fa.pull-left,
  .pull-left.icon,
  .pull-left.android-chrome,
  .pull-left.record-list__records__record[data-draft='true']::before,
  .pull-left.enketo-geopoint-marker,
  .pull-left.glyphicon-chevron-up,
  .pull-left.glyphicon-chevron-down {
    margin-right: 0.3em;
  }

  .fa.pull-right,
  .pull-right.icon,
  .pull-right.android-chrome,
  .pull-right.record-list__records__record[data-draft='true']::before,
  .pull-right.enketo-geopoint-marker,
  .pull-right.glyphicon-chevron-up,
  .pull-right.glyphicon-chevron-down {
    margin-left: 0.3em;
  }

  .fa-spin {
    -webkit-animation: fa-spin 2s infinite linear;
    animation: fa-spin 2s infinite linear;
  }

  .fa-pulse {
    -webkit-animation: fa-spin 1s infinite steps(8);
    animation: fa-spin 1s infinite steps(8);
  }

  @-webkit-keyframes fa-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(359deg);
      transform: rotate(359deg);
    }
  }

  @keyframes fa-spin {
    0% {
      -webkit-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(359deg);
      transform: rotate(359deg);
    }
  }

  .fa-rotate-90 {
    -ms-filter: 'progid:DXImageTransform.Microsoft.BasicImage(rotation=1)';
    -webkit-transform: rotate(90deg);
    -ms-transform: rotate(90deg);
    transform: rotate(90deg);
  }

  .fa-rotate-180 {
    -ms-filter: 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2)';
    -webkit-transform: rotate(180deg);
    -ms-transform: rotate(180deg);
    transform: rotate(180deg);
  }

  .fa-rotate-270 {
    -ms-filter: 'progid:DXImageTransform.Microsoft.BasicImage(rotation=3)';
    -webkit-transform: rotate(270deg);
    -ms-transform: rotate(270deg);
    transform: rotate(270deg);
  }

  .fa-flip-horizontal {
    -ms-filter: 'progid:DXImageTransform.Microsoft.BasicImage(rotation=0, mirror=1)';
    -webkit-transform: scale(-1, 1);
    -ms-transform: scale(-1, 1);
    transform: scale(-1, 1);
  }

  .fa-flip-vertical {
    -ms-filter: 'progid:DXImageTransform.Microsoft.BasicImage(rotation=2, mirror=1)';
    -webkit-transform: scale(1, -1);
    -ms-transform: scale(1, -1);
    transform: scale(1, -1);
  }

  :root .fa-rotate-90,
  :root .fa-rotate-180,
  :root .fa-rotate-270,
  :root .fa-flip-horizontal,
  :root .fa-flip-vertical {
    filter: none;
  }

  .fa-stack {
    position: relative;
    display: inline-block;
    width: 2em;
    height: 2em;
    line-height: 2em;
    vertical-align: middle;
  }

  .fa-stack-1x,
  .fa-stack-2x {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
  }

  .fa-stack-1x {
    line-height: inherit;
  }

  .fa-stack-2x {
    font-size: 2em;
  }

  .fa-inverse {
    color: #fff;
  }

  /* Font Awesome uses the Unicode Private Use Area (PUA) to ensure screen
     readers do not read off random characters that represent icons */
  .fa-glass:before {
    content: '';
  }

  .fa-music:before {
    content: '';
  }

  .fa-search:before,
  .icon-search:before {
    content: '';
  }

  .fa-envelope-o:before {
    content: '';
  }

  .fa-heart:before {
    content: '';
  }

  .fa-star:before {
    content: '';
  }

  .fa-star-o:before,
  .icon-star-o:before {
    content: '';
  }

  .fa-user:before {
    content: '';
  }

  .fa-film:before {
    content: '';
  }

  .fa-th-large:before {
    content: '';
  }

  .fa-th:before {
    content: '';
  }

  .fa-th-list:before {
    content: '';
  }

  .fa-check:before,
  .icon-check:before {
    content: '';
  }

  .fa-remove:before,
  .fa-close:before,
  .fa-times:before {
    content: '';
  }

  .fa-search-plus:before {
    content: '';
  }

  .fa-search-minus:before {
    content: '';
  }

  .fa-power-off:before {
    content: '';
  }

  .fa-signal:before {
    content: '';
  }

  .fa-gear:before,
  .fa-cog:before {
    content: '';
  }

  .fa-trash-o:before {
    content: '';
  }

  .fa-home:before {
    content: '';
  }

  .fa-file-o:before {
    content: '';
  }

  .fa-clock-o:before {
    content: '';
  }

  .fa-road:before {
    content: '';
  }

  .fa-download:before,
  .icon-download:before {
    content: '';
  }

  .fa-arrow-circle-o-down:before {
    content: '';
  }

  .fa-arrow-circle-o-up:before {
    content: '';
  }

  .fa-inbox:before {
    content: '';
  }

  .fa-play-circle-o:before {
    content: '';
  }

  .fa-rotate-right:before,
  .fa-repeat:before {
    content: '';
  }

  .fa-refresh:before,
  .icon-refresh:before {
    content: '';
  }

  .fa-list-alt:before {
    content: '';
  }

  .fa-lock:before {
    content: '';
  }

  .fa-flag:before {
    content: '';
  }

  .fa-headphones:before {
    content: '';
  }

  .fa-volume-off:before {
    content: '';
  }

  .fa-volume-down:before {
    content: '';
  }

  .fa-volume-up:before {
    content: '';
  }

  .fa-qrcode:before {
    content: '';
  }

  .fa-barcode:before {
    content: '';
  }

  .fa-tag:before {
    content: '';
  }

  .fa-tags:before {
    content: '';
  }

  .fa-book:before {
    content: '';
  }

  .fa-bookmark:before {
    content: '';
  }

  .fa-print:before {
    content: '';
  }

  .fa-camera:before {
    content: '';
  }

  .fa-font:before {
    content: '';
  }

  .fa-bold:before {
    content: '';
  }

  .fa-italic:before {
    content: '';
  }

  .fa-text-height:before {
    content: '';
  }

  .fa-text-width:before {
    content: '';
  }

  .fa-align-left:before {
    content: '';
  }

  .fa-align-center:before {
    content: '';
  }

  .fa-align-right:before {
    content: '';
  }

  .fa-align-justify:before {
    content: '';
  }

  .fa-list:before {
    content: '';
  }

  .fa-dedent:before,
  .fa-outdent:before {
    content: '';
  }

  .fa-indent:before {
    content: '';
  }

  .fa-video-camera:before {
    content: '';
  }

  .fa-photo:before,
  .fa-image:before,
  .fa-picture-o:before {
    content: '';
  }

  .fa-pencil:before,
  .icon-pencil:before,
  .record-list__records__record[data-draft='true']:before {
    content: '';
  }

  .fa-map-marker:before,
  .icon-marker:before,
  .enketo-geopoint-marker:before {
    content: '';
  }

  .fa-adjust:before {
    content: '';
  }

  .fa-tint:before {
    content: '';
  }

  .fa-edit:before,
  .fa-pencil-square-o:before {
    content: '';
  }

  .fa-share-square-o:before {
    content: '';
  }

  .fa-check-square-o:before {
    content: '';
  }

  .fa-arrows:before {
    content: '';
  }

  .fa-step-backward:before {
    content: '';
  }

  .fa-fast-backward:before {
    content: '';
  }

  .fa-backward:before {
    content: '';
  }

  .fa-play:before {
    content: '';
  }

  .fa-pause:before {
    content: '';
  }

  .fa-stop:before {
    content: '';
  }

  .fa-forward:before {
    content: '';
  }

  .fa-fast-forward:before {
    content: '';
  }

  .fa-step-forward:before {
    content: '';
  }

  .fa-eject:before {
    content: '';
  }

  .fa-chevron-left:before,
  .icon-chevron-left:before {
    content: '';
  }

  .fa-chevron-right:before,
  .icon-chevron-right:before {
    content: '';
  }

  .fa-plus-circle:before {
    content: '';
  }

  .fa-minus-circle:before {
    content: '';
  }

  .fa-times-circle:before {
    content: '';
  }

  .fa-check-circle:before {
    content: '';
  }

  .fa-question-circle:before {
    content: '';
  }

  .fa-info-circle:before,
  .icon-info-circle:before {
    content: '';
  }

  .fa-crosshairs:before,
  .icon-crosshairs:before {
    content: '';
  }

  .fa-times-circle-o:before {
    content: '';
  }

  .fa-check-circle-o:before {
    content: '';
  }

  .fa-ban:before {
    content: '';
  }

  .fa-arrow-left:before,
  .icon-arrow-left:before {
    content: '';
  }

  .fa-arrow-right:before,
  .icon-arrow-right:before,
  .record-list__records__record.active[data-draft='true']:before {
    content: '';
  }

  .fa-arrow-up:before {
    content: '';
  }

  .fa-arrow-down:before {
    content: '';
  }

  .fa-mail-forward:before,
  .fa-share:before {
    content: '';
  }

  .fa-expand:before {
    content: '';
  }

  .fa-compress:before {
    content: '';
  }

  .fa-plus:before,
  .icon-plus:before {
    content: '';
  }

  .fa-minus:before,
  .icon-minus:before {
    content: '';
  }

  .fa-asterisk:before {
    content: '';
  }

  .fa-exclamation-circle:before {
    content: '';
  }

  .fa-gift:before {
    content: '';
  }

  .fa-leaf:before {
    content: '';
  }

  .fa-fire:before {
    content: '';
  }

  .fa-eye:before {
    content: '';
  }

  .fa-eye-slash:before {
    content: '';
  }

  .fa-warning:before,
  .fa-exclamation-triangle:before {
    content: '';
  }

  .fa-plane:before {
    content: '';
  }

  .fa-calendar:before {
    content: '';
  }

  .fa-random:before {
    content: '';
  }

  .fa-comment:before {
    content: '';
  }

  .fa-magnet:before {
    content: '';
  }

  .fa-chevron-up:before,
  .icon-chevron-up:before,
  .glyphicon-chevron-up:before {
    content: '';
  }

  .fa-chevron-down:before,
  .icon-chevron-down:before,
  .glyphicon-chevron-down:before {
    content: '';
  }

  .fa-retweet:before {
    content: '';
  }

  .fa-shopping-cart:before {
    content: '';
  }

  .fa-folder:before {
    content: '';
  }

  .fa-folder-open:before {
    content: '';
  }

  .fa-arrows-v:before {
    content: '';
  }

  .fa-arrows-h:before {
    content: '';
  }

  .fa-bar-chart-o:before,
  .fa-bar-chart:before {
    content: '';
  }

  .fa-twitter-square:before {
    content: '';
  }

  .fa-facebook-square:before {
    content: '';
  }

  .fa-camera-retro:before {
    content: '';
  }

  .fa-key:before {
    content: '';
  }

  .fa-gears:before,
  .fa-cogs:before {
    content: '';
  }

  .fa-comments:before {
    content: '';
  }

  .fa-thumbs-o-up:before {
    content: '';
  }

  .fa-thumbs-o-down:before {
    content: '';
  }

  .fa-star-half:before {
    content: '';
  }

  .fa-heart-o:before {
    content: '';
  }

  .fa-sign-out:before {
    content: '';
  }

  .fa-linkedin-square:before {
    content: '';
  }

  .fa-thumb-tack:before {
    content: '';
  }

  .fa-external-link:before {
    content: '';
  }

  .fa-sign-in:before {
    content: '';
  }

  .fa-trophy:before {
    content: '';
  }

  .fa-github-square:before {
    content: '';
  }

  .fa-upload:before {
    content: '';
  }

  .fa-lemon-o:before {
    content: '';
  }

  .fa-phone:before {
    content: '';
  }

  .fa-square-o:before {
    content: '';
  }

  .fa-bookmark-o:before,
  .icon-bookmark-o:before {
    content: '';
  }

  .fa-phone-square:before {
    content: '';
  }

  .fa-twitter:before {
    content: '';
  }

  .fa-facebook-f:before,
  .fa-facebook:before {
    content: '';
  }

  .fa-github:before {
    content: '';
  }

  .fa-unlock:before {
    content: '';
  }

  .fa-credit-card:before {
    content: '';
  }

  .fa-feed:before,
  .fa-rss:before {
    content: '';
  }

  .fa-hdd-o:before {
    content: '';
  }

  .fa-bullhorn:before {
    content: '';
  }

  .fa-bell:before {
    content: '';
  }

  .fa-certificate:before {
    content: '';
  }

  .fa-hand-o-right:before {
    content: '';
  }

  .fa-hand-o-left:before {
    content: '';
  }

  .fa-hand-o-up:before {
    content: '';
  }

  .fa-hand-o-down:before {
    content: '';
  }

  .fa-arrow-circle-left:before {
    content: '';
  }

  .fa-arrow-circle-right:before {
    content: '';
  }

  .fa-arrow-circle-up:before {
    content: '';
  }

  .fa-arrow-circle-down:before {
    content: '';
  }

  .fa-globe:before,
  .icon-globe:before {
    content: '';
  }

  .fa-wrench:before {
    content: '';
  }

  .fa-tasks:before {
    content: '';
  }

  .fa-filter:before {
    content: '';
  }

  .fa-briefcase:before {
    content: '';
  }

  .fa-arrows-alt:before {
    content: '';
  }

  .fa-group:before,
  .fa-users:before {
    content: '';
  }

  .fa-chain:before,
  .fa-link:before {
    content: '';
  }

  .fa-cloud:before {
    content: '';
  }

  .fa-flask:before {
    content: '';
  }

  .fa-cut:before,
  .fa-scissors:before {
    content: '';
  }

  .fa-copy:before,
  .fa-files-o:before {
    content: '';
  }

  .fa-paperclip:before {
    content: '';
  }

  .fa-save:before,
  .fa-floppy-o:before {
    content: '';
  }

  .fa-square:before {
    content: '';
  }

  .fa-navicon:before,
  .fa-reorder:before,
  .fa-bars:before {
    content: '';
  }

  .fa-list-ul:before {
    content: '';
  }

  .fa-list-ol:before {
    content: '';
  }

  .fa-strikethrough:before {
    content: '';
  }

  .fa-underline:before {
    content: '';
  }

  .fa-table:before {
    content: '';
  }

  .fa-magic:before {
    content: '';
  }

  .fa-truck:before {
    content: '';
  }

  .fa-pinterest:before {
    content: '';
  }

  .fa-pinterest-square:before {
    content: '';
  }

  .fa-google-plus-square:before {
    content: '';
  }

  .fa-google-plus:before {
    content: '';
  }

  .fa-money:before {
    content: '';
  }

  .fa-caret-down:before {
    content: '';
  }

  .fa-caret-up:before {
    content: '';
  }

  .fa-caret-left:before {
    content: '';
  }

  .fa-caret-right:before {
    content: '';
  }

  .fa-columns:before {
    content: '';
  }

  .fa-unsorted:before,
  .fa-sort:before {
    content: '';
  }

  .fa-sort-down:before,
  .fa-sort-desc:before {
    content: '';
  }

  .fa-sort-up:before,
  .fa-sort-asc:before {
    content: '';
  }

  .fa-envelope:before {
    content: '';
  }

  .fa-linkedin:before {
    content: '';
  }

  .fa-rotate-left:before,
  .fa-undo:before,
  .icon-undo:before {
    content: '';
  }

  .fa-legal:before,
  .fa-gavel:before {
    content: '';
  }

  .fa-dashboard:before,
  .fa-tachometer:before {
    content: '';
  }

  .fa-comment-o:before {
    content: '';
  }

  .fa-comments-o:before {
    content: '';
  }

  .fa-flash:before,
  .fa-bolt:before {
    content: '';
  }

  .fa-sitemap:before {
    content: '';
  }

  .fa-umbrella:before {
    content: '';
  }

  .fa-paste:before,
  .fa-clipboard:before {
    content: '';
  }

  .fa-lightbulb-o:before {
    content: '';
  }

  .fa-exchange:before {
    content: '';
  }

  .fa-cloud-download:before {
    content: '';
  }

  .fa-cloud-upload:before {
    content: '';
  }

  .fa-user-md:before {
    content: '';
  }

  .fa-stethoscope:before {
    content: '';
  }

  .fa-suitcase:before {
    content: '';
  }

  .fa-bell-o:before {
    content: '';
  }

  .fa-coffee:before {
    content: '';
  }

  .fa-cutlery:before {
    content: '';
  }

  .fa-file-text-o:before {
    content: '';
  }

  .fa-building-o:before {
    content: '';
  }

  .fa-hospital-o:before {
    content: '';
  }

  .fa-ambulance:before {
    content: '';
  }

  .fa-medkit:before {
    content: '';
  }

  .fa-fighter-jet:before {
    content: '';
  }

  .fa-beer:before {
    content: '';
  }

  .fa-h-square:before {
    content: '';
  }

  .fa-plus-square:before {
    content: '';
  }

  .fa-angle-double-left:before {
    content: '';
  }

  .fa-angle-double-right:before {
    content: '';
  }

  .fa-angle-double-up:before {
    content: '';
  }

  .fa-angle-double-down:before {
    content: '';
  }

  .fa-angle-left:before {
    content: '';
  }

  .fa-angle-right:before {
    content: '';
  }

  .fa-angle-up:before {
    content: '';
  }

  .fa-angle-down:before {
    content: '';
  }

  .fa-desktop:before {
    content: '';
  }

  .fa-laptop:before {
    content: '';
  }

  .fa-tablet:before {
    content: '';
  }

  .fa-mobile-phone:before,
  .fa-mobile:before {
    content: '';
  }

  .fa-circle-o:before {
    content: '';
  }

  .fa-quote-left:before {
    content: '';
  }

  .fa-quote-right:before {
    content: '';
  }

  .fa-spinner:before {
    content: '';
  }

  .fa-circle:before {
    content: '';
  }

  .fa-mail-reply:before,
  .fa-reply:before {
    content: '';
  }

  .fa-github-alt:before {
    content: '';
  }

  .fa-folder-o:before {
    content: '';
  }

  .fa-folder-open-o:before {
    content: '';
  }

  .fa-smile-o:before {
    content: '';
  }

  .fa-frown-o:before {
    content: '';
  }

  .fa-meh-o:before {
    content: '';
  }

  .fa-gamepad:before {
    content: '';
  }

  .fa-keyboard-o:before {
    content: '';
  }

  .fa-flag-o:before {
    content: '';
  }

  .fa-flag-checkered:before {
    content: '';
  }

  .fa-terminal:before {
    content: '';
  }

  .fa-code:before {
    content: '';
  }

  .fa-mail-reply-all:before,
  .fa-reply-all:before {
    content: '';
  }

  .fa-star-half-empty:before,
  .fa-star-half-full:before,
  .fa-star-half-o:before {
    content: '';
  }

  .fa-location-arrow:before {
    content: '';
  }

  .fa-crop:before {
    content: '';
  }

  .fa-code-fork:before {
    content: '';
  }

  .fa-unlink:before,
  .fa-chain-broken:before {
    content: '';
  }

  .fa-question:before {
    content: '';
  }

  .fa-info:before {
    content: '';
  }

  .fa-exclamation:before {
    content: '';
  }

  .fa-superscript:before {
    content: '';
  }

  .fa-subscript:before {
    content: '';
  }

  .fa-eraser:before {
    content: '';
  }

  .fa-puzzle-piece:before {
    content: '';
  }

  .fa-microphone:before {
    content: '';
  }

  .fa-microphone-slash:before {
    content: '';
  }

  .fa-shield:before {
    content: '';
  }

  .fa-calendar-o:before {
    content: '';
  }

  .fa-fire-extinguisher:before {
    content: '';
  }

  .fa-rocket:before {
    content: '';
  }

  .fa-maxcdn:before {
    content: '';
  }

  .fa-chevron-circle-left:before {
    content: '';
  }

  .fa-chevron-circle-right:before {
    content: '';
  }

  .fa-chevron-circle-up:before {
    content: '';
  }

  .fa-chevron-circle-down:before {
    content: '';
  }

  .fa-html5:before {
    content: '';
  }

  .fa-css3:before {
    content: '';
  }

  .fa-anchor:before {
    content: '';
  }

  .fa-unlock-alt:before {
    content: '';
  }

  .fa-bullseye:before {
    content: '';
  }

  .fa-ellipsis-h:before {
    content: '';
  }

  .fa-ellipsis-v:before,
  .icon-ellipsis-v:before,
  .android-chrome:before {
    content: '';
  }

  .fa-rss-square:before {
    content: '';
  }

  .fa-play-circle:before {
    content: '';
  }

  .fa-ticket:before {
    content: '';
  }

  .fa-minus-square:before {
    content: '';
  }

  .fa-minus-square-o:before {
    content: '';
  }

  .fa-level-up:before {
    content: '';
  }

  .fa-level-down:before {
    content: '';
  }

  .fa-check-square:before {
    content: '';
  }

  .fa-pencil-square:before {
    content: '';
  }

  .fa-external-link-square:before {
    content: '';
  }

  .fa-share-square:before {
    content: '';
  }

  .fa-compass:before {
    content: '';
  }

  .fa-toggle-down:before,
  .fa-caret-square-o-down:before {
    content: '';
  }

  .fa-toggle-up:before,
  .fa-caret-square-o-up:before {
    content: '';
  }

  .fa-toggle-right:before,
  .fa-caret-square-o-right:before {
    content: '';
  }

  .fa-euro:before,
  .fa-eur:before {
    content: '';
  }

  .fa-gbp:before {
    content: '';
  }

  .fa-dollar:before,
  .fa-usd:before {
    content: '';
  }

  .fa-rupee:before,
  .fa-inr:before {
    content: '';
  }

  .fa-cny:before,
  .fa-rmb:before,
  .fa-yen:before,
  .fa-jpy:before {
    content: '';
  }

  .fa-ruble:before,
  .fa-rouble:before,
  .fa-rub:before {
    content: '';
  }

  .fa-won:before,
  .fa-krw:before {
    content: '';
  }

  .fa-bitcoin:before,
  .fa-btc:before {
    content: '';
  }

  .fa-file:before {
    content: '';
  }

  .fa-file-text:before {
    content: '';
  }

  .fa-sort-alpha-asc:before {
    content: '';
  }

  .fa-sort-alpha-desc:before {
    content: '';
  }

  .fa-sort-amount-asc:before {
    content: '';
  }

  .fa-sort-amount-desc:before {
    content: '';
  }

  .fa-sort-numeric-asc:before {
    content: '';
  }

  .fa-sort-numeric-desc:before {
    content: '';
  }

  .fa-thumbs-up:before {
    content: '';
  }

  .fa-thumbs-down:before {
    content: '';
  }

  .fa-youtube-square:before {
    content: '';
  }

  .fa-youtube:before {
    content: '';
  }

  .fa-xing:before {
    content: '';
  }

  .fa-xing-square:before {
    content: '';
  }

  .fa-youtube-play:before {
    content: '';
  }

  .fa-dropbox:before {
    content: '';
  }

  .fa-stack-overflow:before {
    content: '';
  }

  .fa-instagram:before {
    content: '';
  }

  .fa-flickr:before {
    content: '';
  }

  .fa-adn:before {
    content: '';
  }

  .fa-bitbucket:before {
    content: '';
  }

  .fa-bitbucket-square:before {
    content: '';
  }

  .fa-tumblr:before {
    content: '';
  }

  .fa-tumblr-square:before {
    content: '';
  }

  .fa-long-arrow-down:before {
    content: '';
  }

  .fa-long-arrow-up:before {
    content: '';
  }

  .fa-long-arrow-left:before {
    content: '';
  }

  .fa-long-arrow-right:before {
    content: '';
  }

  .fa-apple:before {
    content: '';
  }

  .fa-windows:before {
    content: '';
  }

  .fa-android:before {
    content: '';
  }

  .fa-linux:before {
    content: '';
  }

  .fa-dribbble:before {
    content: '';
  }

  .fa-skype:before {
    content: '';
  }

  .fa-foursquare:before {
    content: '';
  }

  .fa-trello:before {
    content: '';
  }

  .fa-female:before {
    content: '';
  }

  .fa-male:before {
    content: '';
  }

  .fa-gittip:before,
  .fa-gratipay:before {
    content: '';
  }

  .fa-sun-o:before {
    content: '';
  }

  .fa-moon-o:before {
    content: '';
  }

  .fa-archive:before {
    content: '';
  }

  .fa-bug:before {
    content: '';
  }

  .fa-vk:before {
    content: '';
  }

  .fa-weibo:before {
    content: '';
  }

  .fa-renren:before {
    content: '';
  }

  .fa-pagelines:before {
    content: '';
  }

  .fa-stack-exchange:before {
    content: '';
  }

  .fa-arrow-circle-o-right:before {
    content: '';
  }

  .fa-arrow-circle-o-left:before {
    content: '';
  }

  .fa-toggle-left:before,
  .fa-caret-square-o-left:before {
    content: '';
  }

  .fa-dot-circle-o:before {
    content: '';
  }

  .fa-wheelchair:before {
    content: '';
  }

  .fa-vimeo-square:before {
    content: '';
  }

  .fa-turkish-lira:before,
  .fa-try:before {
    content: '';
  }

  .fa-plus-square-o:before {
    content: '';
  }

  .fa-space-shuttle:before {
    content: '';
  }

  .fa-slack:before {
    content: '';
  }

  .fa-envelope-square:before {
    content: '';
  }

  .fa-wordpress:before {
    content: '';
  }

  .fa-openid:before {
    content: '';
  }

  .fa-institution:before,
  .fa-bank:before,
  .fa-university:before {
    content: '';
  }

  .fa-mortar-board:before,
  .fa-graduation-cap:before {
    content: '';
  }

  .fa-yahoo:before {
    content: '';
  }

  .fa-google:before {
    content: '';
  }

  .fa-reddit:before {
    content: '';
  }

  .fa-reddit-square:before {
    content: '';
  }

  .fa-stumbleupon-circle:before {
    content: '';
  }

  .fa-stumbleupon:before {
    content: '';
  }

  .fa-delicious:before {
    content: '';
  }

  .fa-digg:before {
    content: '';
  }

  .fa-pied-piper-pp:before {
    content: '';
  }

  .fa-pied-piper-alt:before {
    content: '';
  }

  .fa-drupal:before {
    content: '';
  }

  .fa-joomla:before {
    content: '';
  }

  .fa-language:before {
    content: '';
  }

  .fa-fax:before {
    content: '';
  }

  .fa-building:before {
    content: '';
  }

  .fa-child:before {
    content: '';
  }

  .fa-paw:before {
    content: '';
  }

  .fa-spoon:before {
    content: '';
  }

  .fa-cube:before {
    content: '';
  }

  .fa-cubes:before {
    content: '';
  }

  .fa-behance:before {
    content: '';
  }

  .fa-behance-square:before {
    content: '';
  }

  .fa-steam:before {
    content: '';
  }

  .fa-steam-square:before {
    content: '';
  }

  .fa-recycle:before {
    content: '';
  }

  .fa-automobile:before,
  .fa-car:before {
    content: '';
  }

  .fa-cab:before,
  .fa-taxi:before {
    content: '';
  }

  .fa-tree:before {
    content: '';
  }

  .fa-spotify:before {
    content: '';
  }

  .fa-deviantart:before {
    content: '';
  }

  .fa-soundcloud:before {
    content: '';
  }

  .fa-database:before {
    content: '';
  }

  .fa-file-pdf-o:before {
    content: '';
  }

  .fa-file-word-o:before {
    content: '';
  }

  .fa-file-excel-o:before {
    content: '';
  }

  .fa-file-powerpoint-o:before {
    content: '';
  }

  .fa-file-photo-o:before,
  .fa-file-picture-o:before,
  .fa-file-image-o:before {
    content: '';
  }

  .fa-file-zip-o:before,
  .fa-file-archive-o:before {
    content: '';
  }

  .fa-file-sound-o:before,
  .fa-file-audio-o:before {
    content: '';
  }

  .fa-file-movie-o:before,
  .fa-file-video-o:before {
    content: '';
  }

  .fa-file-code-o:before {
    content: '';
  }

  .fa-vine:before {
    content: '';
  }

  .fa-codepen:before {
    content: '';
  }

  .fa-jsfiddle:before {
    content: '';
  }

  .fa-life-bouy:before,
  .fa-life-buoy:before,
  .fa-life-saver:before,
  .fa-support:before,
  .fa-life-ring:before {
    content: '';
  }

  .fa-circle-o-notch:before {
    content: '';
  }

  .fa-ra:before,
  .fa-resistance:before,
  .fa-rebel:before {
    content: '';
  }

  .fa-ge:before,
  .fa-empire:before {
    content: '';
  }

  .fa-git-square:before {
    content: '';
  }

  .fa-git:before {
    content: '';
  }

  .fa-y-combinator-square:before,
  .fa-yc-square:before,
  .fa-hacker-news:before {
    content: '';
  }

  .fa-tencent-weibo:before {
    content: '';
  }

  .fa-qq:before {
    content: '';
  }

  .fa-wechat:before,
  .fa-weixin:before {
    content: '';
  }

  .fa-send:before,
  .fa-paper-plane:before {
    content: '';
  }

  .fa-send-o:before,
  .fa-paper-plane-o:before {
    content: '';
  }

  .fa-history:before {
    content: '';
  }

  .fa-circle-thin:before {
    content: '';
  }

  .fa-header:before {
    content: '';
  }

  .fa-paragraph:before {
    content: '';
  }

  .fa-sliders:before {
    content: '';
  }

  .fa-share-alt:before {
    content: '';
  }

  .fa-share-alt-square:before {
    content: '';
  }

  .fa-bomb:before {
    content: '';
  }

  .fa-soccer-ball-o:before,
  .fa-futbol-o:before {
    content: '';
  }

  .fa-tty:before {
    content: '';
  }

  .fa-binoculars:before {
    content: '';
  }

  .fa-plug:before {
    content: '';
  }

  .fa-slideshare:before {
    content: '';
  }

  .fa-twitch:before {
    content: '';
  }

  .fa-yelp:before {
    content: '';
  }

  .fa-newspaper-o:before {
    content: '';
  }

  .fa-wifi:before {
    content: '';
  }

  .fa-calculator:before {
    content: '';
  }

  .fa-paypal:before {
    content: '';
  }

  .fa-google-wallet:before {
    content: '';
  }

  .fa-cc-visa:before {
    content: '';
  }

  .fa-cc-mastercard:before {
    content: '';
  }

  .fa-cc-discover:before {
    content: '';
  }

  .fa-cc-amex:before {
    content: '';
  }

  .fa-cc-paypal:before {
    content: '';
  }

  .fa-cc-stripe:before {
    content: '';
  }

  .fa-bell-slash:before {
    content: '';
  }

  .fa-bell-slash-o:before {
    content: '';
  }

  .fa-trash:before,
  .icon-trash:before {
    content: '';
  }

  .fa-copyright:before {
    content: '';
  }

  .fa-at:before {
    content: '';
  }

  .fa-eyedropper:before {
    content: '';
  }

  .fa-paint-brush:before {
    content: '';
  }

  .fa-birthday-cake:before {
    content: '';
  }

  .fa-area-chart:before {
    content: '';
  }

  .fa-pie-chart:before {
    content: '';
  }

  .fa-line-chart:before {
    content: '';
  }

  .fa-lastfm:before {
    content: '';
  }

  .fa-lastfm-square:before {
    content: '';
  }

  .fa-toggle-off:before {
    content: '';
  }

  .fa-toggle-on:before {
    content: '';
  }

  .fa-bicycle:before {
    content: '';
  }

  .fa-bus:before {
    content: '';
  }

  .fa-ioxhost:before {
    content: '';
  }

  .fa-angellist:before {
    content: '';
  }

  .fa-cc:before {
    content: '';
  }

  .fa-shekel:before,
  .fa-sheqel:before,
  .fa-ils:before {
    content: '';
  }

  .fa-meanpath:before {
    content: '';
  }

  .fa-buysellads:before {
    content: '';
  }

  .fa-connectdevelop:before {
    content: '';
  }

  .fa-dashcube:before {
    content: '';
  }

  .fa-forumbee:before {
    content: '';
  }

  .fa-leanpub:before {
    content: '';
  }

  .fa-sellsy:before {
    content: '';
  }

  .fa-shirtsinbulk:before {
    content: '';
  }

  .fa-simplybuilt:before {
    content: '';
  }

  .fa-skyatlas:before {
    content: '';
  }

  .fa-cart-plus:before {
    content: '';
  }

  .fa-cart-arrow-down:before {
    content: '';
  }

  .fa-diamond:before {
    content: '';
  }

  .fa-ship:before {
    content: '';
  }

  .fa-user-secret:before {
    content: '';
  }

  .fa-motorcycle:before {
    content: '';
  }

  .fa-street-view:before {
    content: '';
  }

  .fa-heartbeat:before {
    content: '';
  }

  .fa-venus:before {
    content: '';
  }

  .fa-mars:before {
    content: '';
  }

  .fa-mercury:before {
    content: '';
  }

  .fa-intersex:before,
  .fa-transgender:before {
    content: '';
  }

  .fa-transgender-alt:before {
    content: '';
  }

  .fa-venus-double:before {
    content: '';
  }

  .fa-mars-double:before {
    content: '';
  }

  .fa-venus-mars:before {
    content: '';
  }

  .fa-mars-stroke:before {
    content: '';
  }

  .fa-mars-stroke-v:before {
    content: '';
  }

  .fa-mars-stroke-h:before {
    content: '';
  }

  .fa-neuter:before {
    content: '';
  }

  .fa-genderless:before {
    content: '';
  }

  .fa-facebook-official:before {
    content: '';
  }

  .fa-pinterest-p:before {
    content: '';
  }

  .fa-whatsapp:before {
    content: '';
  }

  .fa-server:before {
    content: '';
  }

  .fa-user-plus:before {
    content: '';
  }

  .fa-user-times:before {
    content: '';
  }

  .fa-hotel:before,
  .fa-bed:before {
    content: '';
  }

  .fa-viacoin:before {
    content: '';
  }

  .fa-train:before {
    content: '';
  }

  .fa-subway:before {
    content: '';
  }

  .fa-medium:before {
    content: '';
  }

  .fa-yc:before,
  .fa-y-combinator:before {
    content: '';
  }

  .fa-optin-monster:before {
    content: '';
  }

  .fa-opencart:before {
    content: '';
  }

  .fa-expeditedssl:before {
    content: '';
  }

  .fa-battery-4:before,
  .fa-battery-full:before {
    content: '';
  }

  .fa-battery-3:before,
  .fa-battery-three-quarters:before {
    content: '';
  }

  .fa-battery-2:before,
  .fa-battery-half:before {
    content: '';
  }

  .fa-battery-1:before,
  .fa-battery-quarter:before {
    content: '';
  }

  .fa-battery-0:before,
  .fa-battery-empty:before {
    content: '';
  }

  .fa-mouse-pointer:before {
    content: '';
  }

  .fa-i-cursor:before {
    content: '';
  }

  .fa-object-group:before {
    content: '';
  }

  .fa-object-ungroup:before {
    content: '';
  }

  .fa-sticky-note:before,
  .icon-sticky-note:before,
  .btn-comment .icon:before,
  .btn-comment .android-chrome:before,
  .btn-comment .enketo-geopoint-marker:before,
  .btn-comment .glyphicon-chevron-up:before,
  .btn-comment .glyphicon-chevron-down:before {
    content: '';
  }

  .fa-sticky-note-o:before,
  .icon-sticky-note-o:before,
  .btn-comment.empty .icon:before,
  .btn-comment.empty .android-chrome:before,
  .btn-comment.empty .enketo-geopoint-marker:before,
  .btn-comment.empty .glyphicon-chevron-up:before,
  .btn-comment.empty .glyphicon-chevron-down:before {
    content: '';
  }

  .fa-cc-jcb:before {
    content: '';
  }

  .fa-cc-diners-club:before {
    content: '';
  }

  .fa-clone:before {
    content: '';
  }

  .fa-balance-scale:before {
    content: '';
  }

  .fa-hourglass-o:before {
    content: '';
  }

  .fa-hourglass-1:before,
  .fa-hourglass-start:before {
    content: '';
  }

  .fa-hourglass-2:before,
  .fa-hourglass-half:before {
    content: '';
  }

  .fa-hourglass-3:before,
  .fa-hourglass-end:before {
    content: '';
  }

  .fa-hourglass:before {
    content: '';
  }

  .fa-hand-grab-o:before,
  .fa-hand-rock-o:before {
    content: '';
  }

  .fa-hand-stop-o:before,
  .fa-hand-paper-o:before {
    content: '';
  }

  .fa-hand-scissors-o:before {
    content: '';
  }

  .fa-hand-lizard-o:before {
    content: '';
  }

  .fa-hand-spock-o:before {
    content: '';
  }

  .fa-hand-pointer-o:before {
    content: '';
  }

  .fa-hand-peace-o:before {
    content: '';
  }

  .fa-trademark:before {
    content: '';
  }

  .fa-registered:before {
    content: '';
  }

  .fa-creative-commons:before {
    content: '';
  }

  .fa-gg:before {
    content: '';
  }

  .fa-gg-circle:before {
    content: '';
  }

  .fa-tripadvisor:before {
    content: '';
  }

  .fa-odnoklassniki:before {
    content: '';
  }

  .fa-odnoklassniki-square:before {
    content: '';
  }

  .fa-get-pocket:before {
    content: '';
  }

  .fa-wikipedia-w:before {
    content: '';
  }

  .fa-safari:before {
    content: '';
  }

  .fa-chrome:before {
    content: '';
  }

  .fa-firefox:before {
    content: '';
  }

  .fa-opera:before {
    content: '';
  }

  .fa-internet-explorer:before {
    content: '';
  }

  .fa-tv:before,
  .fa-television:before {
    content: '';
  }

  .fa-contao:before {
    content: '';
  }

  .fa-500px:before {
    content: '';
  }

  .fa-amazon:before {
    content: '';
  }

  .fa-calendar-plus-o:before {
    content: '';
  }

  .fa-calendar-minus-o:before {
    content: '';
  }

  .fa-calendar-times-o:before {
    content: '';
  }

  .fa-calendar-check-o:before {
    content: '';
  }

  .fa-industry:before {
    content: '';
  }

  .fa-map-pin:before {
    content: '';
  }

  .fa-map-signs:before {
    content: '';
  }

  .fa-map-o:before {
    content: '';
  }

  .fa-map:before {
    content: '';
  }

  .fa-commenting:before {
    content: '';
  }

  .fa-commenting-o:before {
    content: '';
  }

  .fa-houzz:before {
    content: '';
  }

  .fa-vimeo:before {
    content: '';
  }

  .fa-black-tie:before {
    content: '';
  }

  .fa-fonticons:before {
    content: '';
  }

  .fa-reddit-alien:before {
    content: '';
  }

  .fa-edge:before {
    content: '';
  }

  .fa-credit-card-alt:before {
    content: '';
  }

  .fa-codiepie:before {
    content: '';
  }

  .fa-modx:before {
    content: '';
  }

  .fa-fort-awesome:before {
    content: '';
  }

  .fa-usb:before {
    content: '';
  }

  .fa-product-hunt:before {
    content: '';
  }

  .fa-mixcloud:before {
    content: '';
  }

  .fa-scribd:before {
    content: '';
  }

  .fa-pause-circle:before {
    content: '';
  }

  .fa-pause-circle-o:before {
    content: '';
  }

  .fa-stop-circle:before {
    content: '';
  }

  .fa-stop-circle-o:before {
    content: '';
  }

  .fa-shopping-bag:before {
    content: '';
  }

  .fa-shopping-basket:before {
    content: '';
  }

  .fa-hashtag:before {
    content: '';
  }

  .fa-bluetooth:before {
    content: '';
  }

  .fa-bluetooth-b:before {
    content: '';
  }

  .fa-percent:before {
    content: '';
  }

  .fa-gitlab:before {
    content: '';
  }

  .fa-wpbeginner:before {
    content: '';
  }

  .fa-wpforms:before {
    content: '';
  }

  .fa-envira:before {
    content: '';
  }

  .fa-universal-access:before {
    content: '';
  }

  .fa-wheelchair-alt:before {
    content: '';
  }

  .fa-question-circle-o:before {
    content: '';
  }

  .fa-blind:before {
    content: '';
  }

  .fa-audio-description:before {
    content: '';
  }

  .fa-volume-control-phone:before {
    content: '';
  }

  .fa-braille:before {
    content: '';
  }

  .fa-assistive-listening-systems:before {
    content: '';
  }

  .fa-asl-interpreting:before,
  .fa-american-sign-language-interpreting:before {
    content: '';
  }

  .fa-deafness:before,
  .fa-hard-of-hearing:before,
  .fa-deaf:before {
    content: '';
  }

  .fa-glide:before {
    content: '';
  }

  .fa-glide-g:before {
    content: '';
  }

  .fa-signing:before,
  .fa-sign-language:before {
    content: '';
  }

  .fa-low-vision:before {
    content: '';
  }

  .fa-viadeo:before {
    content: '';
  }

  .fa-viadeo-square:before {
    content: '';
  }

  .fa-snapchat:before {
    content: '';
  }

  .fa-snapchat-ghost:before {
    content: '';
  }

  .fa-snapchat-square:before {
    content: '';
  }

  .fa-pied-piper:before {
    content: '';
  }

  .fa-first-order:before {
    content: '';
  }

  .fa-yoast:before {
    content: '';
  }

  .fa-themeisle:before {
    content: '';
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }

  .sr-only-focusable:active,
  .sr-only-focusable:focus {
    position: static;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
    clip: auto;
  }

  @font-face {
    font-family: 'OpenSans';
    src: url('assets/fonts/OpenSans-Regular-webfont.woff') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'OpenSans';
    src: url('assets/fonts/OpenSans-Bold-webfont.woff') format('woff');
    font-weight: bold;
    font-style: normal;
  }

  @keyframes pulsate {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      opacity: 0.8;
    }
    100% {
      transform: scale(1.2);
      opacity: 0;
    }
  }

  * {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  *:before,
  *:after {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  html {
    font-size: 62.5%;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  body {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    font-size: 16px;
    line-height: 1.25;
    color: #333333;
    background-color: white;
  }

  input,
  button,
  select,
  textarea {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
  }

  a {
    color: #ee7325;
  }
  a:hover,
  a:focus {
    color: #843304;
  }
  a:focus {
    outline: thin dotted;
    outline: 5px auto -webkit-focus-ring-color;
    outline-offset: -2px;
  }

  figure {
    margin: 0;
  }

  img {
    vertical-align: middle;
  }

  hr {
    margin-top: 20px;
    margin-bottom: 20px;
    border: 0;
    border-top: 1px solid #eeeeee;
  }

  strong {
    font-weight: bold;
  }

  h1 {
    font-size: 44px;
  }

  h2 {
    font-size: 36px;
  }

  h3 {
    font-size: 28px;
  }

  h4 {
    font-size: 20px;
  }

  h5 {
    font-size: 16px;
  }

  h6 {
    font-size: 13.6px;
  }

  h2,
  h3,
  h4 {
    font-weight: bold;
  }

  input,
  select,
  textarea {
    font-weight: normal;
  }

  .iframe .paper {
    border-radius: 0;
    border: none;
  }

  .iframe .form-header__button--homescreen {
    display: none;
  }

  .ios-iframe-bug-wrap {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    overflow: auto;
  }
  .ios-iframe-bug-wrap .main-loader {
    height: 100vh;
  }

  .edit .paper .branding {
    display: none;
  }

  @media screen and (max-width: 720px) {
    body.edit .form-header {
      border-bottom: none;
    }
  }

  @keyframes vex-fadein {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  @keyframes vex-fadeout {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes vex-rotation {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(359deg);
    }
  }

  .vex,
  .vex *,
  .vex *:before,
  .vex *:after {
    box-sizing: border-box;
  }

  .vex {
    position: fixed;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    z-index: 1111;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .vex-scrollbar-measure {
    position: absolute;
    top: -9999px;
    width: 50px;
    height: 50px;
    overflow: scroll;
  }

  .vex-overlay,
  .show-side-slider .slider-overlay {
    animation: vex-fadein 0.5s;
    position: fixed;
    z-index: 1111;
    background: rgba(0, 0, 0, 0.4);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .vex-overlay.vex-closing,
  .show-side-slider .vex-closing.slider-overlay {
    animation: vex-fadeout 0.5s forwards;
  }

  .vex-content {
    animation: vex-fadein 0.5s;
    background: #fff;
  }

  .vex.vex-closing .vex-content {
    animation: vex-fadeout 0.5s forwards;
  }

  .vex-close:before {
    font-family: Arial, sans-serif;
    content: '\00D7';
  }

  .vex-dialog-form {
    margin: 0;
  }

  .vex-dialog-button {
    text-rendering: optimizeLegibility;
    appearance: none;
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }

  .vex-loading-spinner {
    animation: vex-rotation 0.7s linear infinite;
    box-shadow: 0 0 1em rgba(0, 0, 0, 0.1);
    position: fixed;
    z-index: 1112;
    margin: auto;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    height: 2em;
    width: 2em;
    background: #fff;
  }

  body.vex-open {
    overflow: hidden;
  }

  @keyframes vex-pulse {
    0% {
      box-shadow: inset 0 0 0 300px transparent;
    }
    70% {
      box-shadow: inset 0 0 0 300px rgba(255, 255, 255, 0.25);
    }
    100% {
      box-shadow: inset 0 0 0 300px transparent;
    }
  }

  .vex.vex-theme-plain {
    padding-top: 160px;
    padding-bottom: 160px;
  }
  .vex.vex-theme-plain .vex-content {
    font-family: 'Helvetica Neue', sans-serif;
    background: #fff;
    color: #444;
    padding: 1em;
    position: relative;
    margin: 0 auto;
    max-width: 100%;
    width: 450px;
    font-size: 1.1em;
    line-height: 1.5em;
  }
  .vex.vex-theme-plain .vex-content h1,
  .vex.vex-theme-plain .vex-content h2,
  .vex.vex-theme-plain .vex-content h3,
  .vex.vex-theme-plain .vex-content h4,
  .vex.vex-theme-plain .vex-content h5,
  .vex.vex-theme-plain .vex-content h6,
  .vex.vex-theme-plain .vex-content p,
  .vex.vex-theme-plain .vex-content ul,
  .vex.vex-theme-plain .vex-content li {
    color: inherit;
  }
  .vex.vex-theme-plain .vex-close {
    position: absolute;
    top: 0;
    right: 0;
    cursor: pointer;
  }
  .vex.vex-theme-plain .vex-close:before {
    position: absolute;
    content: '\00D7';
    font-size: 26px;
    font-weight: normal;
    line-height: 31px;
    height: 30px;
    width: 30px;
    text-align: center;
    top: 3px;
    right: 3px;
    color: #bbb;
    background: transparent;
  }
  .vex.vex-theme-plain .vex-close:hover:before,
  .vex.vex-theme-plain .vex-close:active:before {
    color: #777;
    background: #e0e0e0;
  }
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-message {
    margin-bottom: 0.5em;
  }
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input {
    margin-bottom: 1em;
  }
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input select,
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input textarea,
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='date'],
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='datetime'],
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='datetime-local'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='email'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='month'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='number'],
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='password'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='search'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='tel'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='text'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='time'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='url'],
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input input[type='week'] {
    background: #f0f0f0;
    width: 100%;
    padding: 0.25em 0.67em;
    border: 0;
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    min-height: 2.5em;
    margin: 0 0 0.25em;
  }
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input select:focus,
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-input textarea:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='date']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='datetime']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='datetime-local']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='email']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='month']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='number']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='password']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='search']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='tel']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='text']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='time']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='url']:focus,
  .vex.vex-theme-plain
    .vex-dialog-form
    .vex-dialog-input
    input[type='week']:focus {
    box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.2);
    outline: none;
  }
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-buttons {
    *zoom: 1;
  }
  .vex.vex-theme-plain .vex-dialog-form .vex-dialog-buttons:after {
    content: '';
    display: table;
    clear: both;
  }
  .vex.vex-theme-plain .vex-dialog-button {
    border-radius: 0;
    border: 0;
    float: right;
    margin: 0 0 0 0.5em;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-size: 0.8em;
    line-height: 1em;
    padding: 0.75em 2em;
  }
  .vex.vex-theme-plain .vex-dialog-button.vex-last {
    margin-left: 0;
  }
  .vex.vex-theme-plain .vex-dialog-button:focus {
    animation: vex-pulse 1.1s infinite;
    outline: none;
  }
  @media (max-width: 568px) {
    .vex.vex-theme-plain .vex-dialog-button:focus {
      animation: none;
    }
  }
  .vex.vex-theme-plain .vex-dialog-button.vex-dialog-button-primary {
    background: #3288e6;
    color: #fff;
  }
  .vex.vex-theme-plain .vex-dialog-button.vex-dialog-button-secondary {
    background: #e0e0e0;
    color: #777;
  }

  .vex-loading-spinner.vex-theme-plain {
    height: 2.5em;
    width: 2.5em;
  }

  .vex.vex-theme-plain h3 {
    margin-top: 10px;
    color: #333333;
  }

  .vex.vex-theme-plain .vex-content {
    width: 550px;
    border: 4px solid #ccc;
    border-radius: 4px;
  }

  .vex.vex-theme-plain .vex-dialog-button {
    margin-top: 20px !important;
    margin-left: 30px !important;
    margin-bottom: 0 !important;
  }

  .vex.vex-theme-plain .vex-auto-close-timer {
    position: absolute;
    bottom: 12px;
    color: #999999;
  }

  .vex.vex-theme-plain .vex-dialog-input input[type='checkbox'],
  .vex.vex-theme-plain .vex-dialog-input input[type='radio'] {
    margin-right: 10px;
  }

  .vex.vex-theme-plain .or-hint.active {
    margin-bottom: 10px;
  }

  .vex.vex-theme-plain .vex-dialog-link {
    margin-top: 20px;
    font-size: 0.8em;
    font-color: #555555;
    text-align: center;
    display: block;
  }

  .vex.vex-theme-plain .vex-dialog-input fieldset {
    margin: 20px 0;
  }

  .vex.vex-theme-plain .vex-dialog-input legend {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 10px;
  }
  .vex.vex-theme-plain .vex-dialog-input legend ~ label {
    display: inline-block;
    width: auto;
    font-weight: normal;
  }
  .vex.vex-theme-plain .vex-dialog-input legend ~ label input[type='radio'] {
    width: auto;
    display: inline-block;
    height: auto;
    margin-left: 10px;
  }
  .vex.vex-theme-plain .vex-dialog-input legend ~ label:hover {
    background: none;
  }
  .vex.vex-theme-plain .vex-dialog-input legend ~ label + label {
    margin-left: 20px;
  }

  .ios-safari {
    display: inline-block;
    width: 25px;
    height: 30px;
    margin-bottom: -3px;
    background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAA/CAYAAACrSjsVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACw2lUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyI+CiAgICAgICAgIDxwaG90b3Nob3A6RGF0ZUNyZWF0ZWQ+MjAxNS0xMi0yNFQwOToxODozMTwvcGhvdG9zaG9wOkRhdGVDcmVhdGVkPgogICAgICAgICA8ZXhpZjpVc2VyQ29tbWVudD4KICAgICAgICAgICAgPHJkZjpBbHQ+CiAgICAgICAgICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+U2NyZWVuc2hvdDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpBbHQ+CiAgICAgICAgIDwvZXhpZjpVc2VyQ29tbWVudD4KICAgICAgICAgPHRpZmY6T3JpZW50YXRpb24+MTwvdGlmZjpPcmllbnRhdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CqO4YmMAAAIkSURBVGgF7ZrPSsNAEMZnTaOCvogeFAQv2h7EiwcREU+CJ0+eBBFEoSK1tIhePKigT+ADeNfWgx68+SjaRtKo2dJtlKKZltkhjbOlJCST+eab32ZJ/6harfYJKRwDKfTUtCTG+o0sG7Hygwv6zTUyHELaUOkuktrL+tZlIzVLUsWKC8eVSMYYtG0uA8qSozBt8f6nKaPUNpezR25Ahc5svL6bys81jCcw+9pcuepa0dZ+rCweh2HRZvoV5n3YzUbG9L4+poc2V6pG07TtnmCH3Jg2ddoq9mTBh+2ZoKNMfUyf08OWOdJ2GVMqbNfFog/rk52mjMvN6QAGHYCt22jF3M9FZE1cr1syYmePTpOUNnW9/LcpU+zGVACXSz7oazS5q+fQKdEgI7Y2EcDNiwM7sw1YGftAl6epumEV508OrI7/ThidsBWo6vU6y9P96NFwU/I173VbY0/xZFOxJ3WLF4kxi821kjq1xGJXRXPTd9tW7CJhK///JWZIYQmYeOy227xYwqklJsawUyspcUIsKSSwdQgxbKeSEifEkkICW4cQw3YqKXFCLCkksHUIMWynkhKXUQr3cws2Ls4YV57YrwbiCsWefzt4x4aSxMk9RtJGxiRCjLHZJFJCjKSNjEmEGGOzSaSEGEkbGZMIMcZmk0gJMZI2MiYRYozNJpFCf9AcKQyRCHIlSe1UVJ7nsfzliIuU0UktMTFmEPfLVoj1CylT5xd6HHOR9k4uUAAAAABJRU5ErkJggg==);
    background-size: 25px 30px;
    background-repeat: no-repeat;
  }

  .android-chrome {
    padding: 0 5px;
  }

  @media screen and (max-width: 400px) {
    .vex.vex-theme-plain {
      padding: 0;
    }
  }

  .alert-box {
    width: 100%;
    padding: 10px;
  }
  .alert-box.error {
    background-color: #f2dede;
    color: #a94442;
    border: #ebccd1;
  }
  .alert-box.warning {
    background-color: #fcf8e3;
    color: #8a6d3b;
    border: #faebcc;
  }
  .alert-box.success {
    background-color: #dff0d8;
    color: #3c763d;
    border: #d6e9c6;
  }
  .alert-box.info {
    background-color: #d9edf7;
    color: #31708f;
    border: #bce8f1;
  }
  .alert-box em {
    color: #666;
  }
  .alert-box strong {
    color: black;
    font-size: 110%;
    text-decoration: none;
  }
  .alert-box a {
    text-decoration: underline;
  }
  .alert-box .error-list {
    margin-top: 1em;
    font-size: 0.8em;
  }
  .alert-box .error-list li {
    line-height: 1.4em;
  }

  #feedback-bar {
    -webkit-transition: all 1s ease-out;
    transition: all 1s ease-out;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border-radius: 0;
    position: fixed;
    z-index: 13;
    top: -100px;
    margin: 0;
    padding: 0;
    width: 100%;
    min-height: 35px;
    height: auto;
    z-index: 5000;
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }
  #feedback-bar p {
    position: relative;
    margin: 0 50px;
    text-align: center;
    padding: 0.6em 0;
    font-size: 1.1em;
  }
  #feedback-bar p + p {
    border-top: 1px #ddd dashed;
  }
  #feedback-bar .icon-info-circle,
  #feedback-bar .close {
    position: absolute;
    top: 50%;
  }
  #feedback-bar .icon-info-circle {
    margin-top: -7.5px;
    left: 20px;
  }
  #feedback-bar .close {
    margin-top: -10.5px;
    right: 20px;
  }
  #feedback-bar.feedback-bar--show {
    top: 0px;
  }

  .notification {
    border: 2px solid #ee7325;
    width: calc((100% - 1100px) / 2 - 40px);
    min-height: 140px;
    border-radius: 5px;
    padding: 10px;
    position: absolute;
    background: white;
    line-height: 22px;
    top: 100px;
    left: 20px;
  }

  @media screen and (max-width: 1023px) {
    .notification {
      display: none;
    }
  }

  .main-loader__image {
    border-color: #ee7325;
  }

  .clearfix:before,
  .clearfix:after {
    content: ' ';
    display: table;
  }

  .clearfix:after {
    clear: both;
  }

  .center-block {
    display: block;
    margin-left: auto;
    margin-right: auto;
  }

  .pull-right {
    float: right !important;
  }

  .pull-left {
    float: left !important;
  }

  .hide {
    display: none !important;
  }

  .show {
    display: block !important;
  }

  .invisible {
    visibility: hidden;
  }

  .text-hide {
    font: 0/0 a;
    color: transparent;
    text-shadow: none;
    background-color: transparent;
    border: 0;
  }

  .hidden {
    display: none !important;
    visibility: hidden !important;
  }

  .affix {
    position: fixed;
  }

  button {
    background: none;
    border: none;
  }

  .btn,
  .vex.vex-theme-plain .vex-dialog-button {
    border-style: solid;
    border-width: 1px;
    cursor: pointer;
    font-family: 'OpenSans';
    font-weight: normal;
    line-height: normal;
    margin: 0 0 16px;
    position: relative;
    text-decoration: none;
    text-align: center;
    -webkit-appearance: none;
    -webkit-border-radius: 0;
    align-items: center;
    justify-content: center;
    display: flex;
    padding-top: 16px;
    padding-right: 32px;
    padding-bottom: 16px;
    padding-left: 32px;
    font-size: 16px;
    background-color: #ee7325;
    border-color: #a53f06;
    color: white;
    border-radius: 3px;
    transition: background-color 300ms ease-out;
  }
  .btn:hover,
  .vex.vex-theme-plain .vex-dialog-button:hover,
  .btn:focus,
  .vex.vex-theme-plain .vex-dialog-button:focus {
    background-color: #a53f06;
  }
  .btn:hover,
  .vex.vex-theme-plain .vex-dialog-button:hover,
  .btn:focus,
  .vex.vex-theme-plain .vex-dialog-button:focus {
    color: white;
  }
  .btn:focus,
  .vex.vex-theme-plain .vex-dialog-button:focus,
  .btn:link,
  .vex.vex-theme-plain .vex-dialog-button:link,
  .btn:active,
  .vex.vex-theme-plain .vex-dialog-button:active,
  .btn:visited,
  .vex.vex-theme-plain .vex-dialog-button:visited {
    text-decoration: none;
  }
  .btn.btn-default,
  .vex.vex-theme-plain .btn-default.vex-dialog-button {
    background-color: white;
    border-color: #cccccc;
    color: #333333;
    border-radius: 3px;
  }
  .btn.btn-default:hover,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:hover,
  .btn.btn-default:focus,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:focus {
    background-color: #cccccc;
  }
  .btn.btn-default:hover,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:hover,
  .btn.btn-default:focus,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:focus {
    color: #333333;
  }
  .btn.btn-default:focus,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:focus,
  .btn.btn-default:link,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:link,
  .btn.btn-default:active,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:active,
  .btn.btn-default:visited,
  .vex.vex-theme-plain .btn-default.vex-dialog-button:visited {
    text-decoration: none;
  }
  .btn.small,
  .vex.vex-theme-plain .small.vex-dialog-button,
  .vex.vex-theme-plain
    .vex-dialog-button.or-comment-widget__content__btn-update,
  .btn.or-comment-widget__content__btn-update {
    padding-top: 10px;
    padding-right: 20px;
    padding-bottom: 10px;
    padding-left: 20px;
    font-size: 14px;
  }
  .btn.disabled,
  .vex.vex-theme-plain .disabled.vex-dialog-button,
  .btn[disabled],
  .vex.vex-theme-plain .vex-dialog-button[disabled] {
    background-color: #ee7325;
    border-color: #a53f06;
    color: white;
    cursor: default;
    opacity: 0.7;
    box-shadow: none;
    border-radius: 3px;
  }
  .btn.disabled:hover,
  .vex.vex-theme-plain .disabled.vex-dialog-button:hover,
  .btn.disabled:focus,
  .vex.vex-theme-plain .disabled.vex-dialog-button:focus,
  .btn[disabled]:hover,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:hover,
  .btn[disabled]:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:focus {
    background-color: #a53f06;
  }
  .btn.disabled:hover,
  .vex.vex-theme-plain .disabled.vex-dialog-button:hover,
  .btn.disabled:focus,
  .vex.vex-theme-plain .disabled.vex-dialog-button:focus,
  .btn[disabled]:hover,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:hover,
  .btn[disabled]:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:focus {
    color: white;
  }
  .btn.disabled:focus,
  .vex.vex-theme-plain .disabled.vex-dialog-button:focus,
  .btn.disabled:link,
  .vex.vex-theme-plain .disabled.vex-dialog-button:link,
  .btn.disabled:active,
  .vex.vex-theme-plain .disabled.vex-dialog-button:active,
  .btn.disabled:visited,
  .vex.vex-theme-plain .disabled.vex-dialog-button:visited,
  .btn[disabled]:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:focus,
  .btn[disabled]:link,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:link,
  .btn[disabled]:active,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:active,
  .btn[disabled]:visited,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:visited {
    text-decoration: none;
  }
  .btn.disabled:hover,
  .vex.vex-theme-plain .disabled.vex-dialog-button:hover,
  .btn.disabled:focus,
  .vex.vex-theme-plain .disabled.vex-dialog-button:focus,
  .btn[disabled]:hover,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:hover,
  .btn[disabled]:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled]:focus {
    background-color: #ee7325;
  }
  .btn.disabled.btn-default,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button,
  .btn[disabled].btn-default,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default {
    background-color: white;
    border-color: #cccccc;
    color: #333333;
    cursor: default;
    opacity: 0.7;
    box-shadow: none;
    border-radius: 3px;
  }
  .btn.disabled.btn-default:hover,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:hover,
  .btn.disabled.btn-default:focus,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:focus,
  .btn[disabled].btn-default:hover,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:hover,
  .btn[disabled].btn-default:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:focus {
    background-color: #cccccc;
  }
  .btn.disabled.btn-default:hover,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:hover,
  .btn.disabled.btn-default:focus,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:focus,
  .btn[disabled].btn-default:hover,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:hover,
  .btn[disabled].btn-default:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:focus {
    color: #333333;
  }
  .btn.disabled.btn-default:focus,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:focus,
  .btn.disabled.btn-default:link,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:link,
  .btn.disabled.btn-default:active,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:active,
  .btn.disabled.btn-default:visited,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:visited,
  .btn[disabled].btn-default:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:focus,
  .btn[disabled].btn-default:link,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:link,
  .btn[disabled].btn-default:active,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:active,
  .btn[disabled].btn-default:visited,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:visited {
    text-decoration: none;
  }
  .btn.disabled.btn-default:hover,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:hover,
  .btn.disabled.btn-default:focus,
  .vex.vex-theme-plain .disabled.btn-default.vex-dialog-button:focus,
  .btn[disabled].btn-default:hover,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:hover,
  .btn[disabled].btn-default:focus,
  .vex.vex-theme-plain .vex-dialog-button[disabled].btn-default:focus {
    background-color: white;
  }
  .btn .icon,
  .vex.vex-theme-plain .vex-dialog-button .icon,
  .btn .android-chrome,
  .vex.vex-theme-plain .vex-dialog-button .android-chrome,
  .btn .record-list__records__record[data-draft='true']::before,
  .vex.vex-theme-plain
    .vex-dialog-button
    .record-list__records__record[data-draft='true']::before,
  .btn .enketo-geopoint-marker,
  .vex.vex-theme-plain .vex-dialog-button .enketo-geopoint-marker,
  .btn .glyphicon-chevron-up,
  .vex.vex-theme-plain .vex-dialog-button .glyphicon-chevron-up,
  .btn .glyphicon-chevron-down,
  .vex.vex-theme-plain .vex-dialog-button .glyphicon-chevron-down {
    margin-right: 6px;
  }

  button::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  @media only screen and (min-width: lower-bound(40.063em, 64em)) {
    button,
    .button {
      display: inline-block;
    }
  }

  .btn-icon-only {
    margin: 0 10px 0 10px;
    padding: 0;
    color: #333333;
    background: none;
    border: none;
    font-size: 20px;
    box-shadow: none;
    opacity: 0.7;
  }
  .btn-icon-only:hover,
  .btn-icon-only:focus,
  .btn-icon-only:active,
  .btn-icon-only.active,
  .btn-icon-only:disabled,
  .btn-icon-only.disabled {
    background: none;
    box-shadow: none;
  }
  .btn-icon-only:hover {
    color: #333333;
    opacity: 0.5;
  }

  .btn-bg-icon-only {
    margin: 0 10px 0 10px;
    padding: 0;
    border: none;
  }
  .btn-bg-icon-only:hover,
  .btn-bg-icon-only:focus,
  .btn-bg-icon-only:active,
  .btn-bg-icon-only.active,
  .btn-bg-icon-only:disabled,
  .btn-bg-icon-only.disabled {
    box-shadow: none;
  }
  .btn-bg-icon-only:hover {
    opacity: 0.5;
  }

  .question:not(.or-appearance-literacy) .btn-default {
    padding: 0 15px;
  }

  .question .btn-default.dropdown-toggle {
    padding: 7px 15px;
  }

  .draw-widget__undo {
    font-size: 13px;
  }

  .add-repeat-btn .icon,
  .add-repeat-btn .android-chrome,
  .add-repeat-btn .record-list__records__record[data-draft='true']::before,
  .add-repeat-btn .enketo-geopoint-marker,
  .add-repeat-btn .glyphicon-chevron-up,
  .add-repeat-btn .glyphicon-chevron-down,
  .repeat-buttons .remove .icon,
  .repeat-buttons .remove .android-chrome,
  .repeat-buttons
    .remove
    .record-list__records__record[data-draft='true']::before,
  .repeat-buttons .remove .enketo-geopoint-marker,
  .repeat-buttons .remove .glyphicon-chevron-up,
  .repeat-buttons .remove .glyphicon-chevron-down,
  .geopicker [name='geodetect'] .icon,
  .geopicker [name='geodetect'] .android-chrome,
  .geopicker
    [name='geodetect']
    .record-list__records__record[data-draft='true']::before,
  .geopicker [name='geodetect'] .enketo-geopoint-marker,
  .geopicker [name='geodetect'] .glyphicon-chevron-up,
  .geopicker [name='geodetect'] .glyphicon-chevron-down {
    margin-right: 0;
  }

  html {
    height: 100%;
  }

  body {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    position: relative;
    min-height: 100%;
  }

  .paper {
    border-width: 1px;
    box-shadow: 0 0 5px #888;
    background-color: #fff;
    position: relative;
    min-height: 100%;
  }

  .or {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    margin-bottom: 20px;
  }

  .main {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    margin: 0 auto;
    padding: 100px 0 70px 0;
    position: relative;
    width: 100%;
    max-width: 1100px;
  }

  .paper {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    padding: 45px;
    position: relative;
    min-height: 100%;
  }

  .form-header {
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    position: absolute;
    left: 0;
    top: -76px;
    width: 100%;
    min-height: 69px;
    padding: 16px 0;
  }

  .form-language-selector {
    padding: 0;
    margin-left: 10px;
    font-size: 0.8em;
  }

  #form-languages {
    display: inline;
    width: auto;
    height: 36px;
    background: none;
    min-width: 11em;
    border: 1px solid #ccc;
    margin: 0 0 0 16px;
    font-size: 0.9em;
  }

  [dir='rtl'] #form-languages {
    margin: 0 16px 0 0;
  }

  .form-footer {
    margin: 45px -45px -45px -45px;
  }

  .enketo-power {
    position: relative;
    left: 50%;
    margin: 30px 0 0 -100px;
    width: 200px;
    font-size: 16px;
    line-height: 23px;
    text-align: center;
  }
  .enketo-power a {
    font-style: italic;
  }
  .enketo-power img {
    float: none;
    vertical-align: top;
    width: 48px;
  }

  .pages.or .or-group,
  .pages.or .or-group-data,
  .pages.or .or-repeat {
    display: block;
  }
  .pages.or .or-group.contains-current,
  .pages.or .or-group-data.contains-current,
  .pages.or .or-repeat.contains-current {
    display: block;
  }

  .pages.or .or-repeat[role='page'].current + .or-repeat-info {
    display: block;
  }

  .pages.or [role='page'] {
    display: none;
  }
  .pages.or [role='page'].current {
    display: block;
  }
  .pages.or [role='page'].current .or-group:not(.disabled),
  .pages.or [role='page'].current .or-group-data:not(.disabled),
  .pages.or [role='page'].current .or-repeat:not(.disabled) {
    display: block;
  }
  .pages.or [role='page'].hidden {
    opacity: 0;
  }
  .pages.or [role='page'].fade-out {
    opacity: 0;
    -webkit-transition: all 0.6s ease-out;
    transition: all 0.6s ease-out;
  }

  .pages.or #form-title {
    margin: 0;
  }

  .pages ~ .form-footer {
    margin-top: 0;
  }
  .pages ~ .form-footer.end .btn,
  .pages ~ .form-footer.end .vex.vex-theme-plain .vex-dialog-button,
  .vex.vex-theme-plain .pages ~ .form-footer.end .vex-dialog-button {
    display: inline-block;
  }
  .pages ~ .form-footer.end .next-page {
    display: none;
  }
  .pages ~ .form-footer.end .logout,
  .pages ~ .form-footer.end .draft {
    display: block;
  }
  .pages ~ .form-footer .logout {
    margin-bottom: 50px;
  }
  .pages ~ .form-footer .btn,
  .pages ~ .form-footer .vex.vex-theme-plain .vex-dialog-button,
  .vex.vex-theme-plain .pages ~ .form-footer .vex-dialog-button {
    display: none;
  }
  .pages ~ .form-footer .previous-page,
  .pages ~ .form-footer .next-page {
    display: inline-block;
  }
  .pages ~ .form-footer .previous-page.disabled,
  .pages ~ .form-footer .next-page.disabled {
    display: none;
  }
  .pages ~ .form-footer .first-page,
  .pages ~ .form-footer .last-page {
    display: inline-block;
  }
  .pages ~ .form-footer .logout,
  .pages ~ .form-footer .draft {
    display: none;
  }

  .pages-toc__list {
    border: 1px solid black;
    border-width: 1px;
    box-shadow: 0 0 5px #888;
    position: absolute;
    right: 0;
    left: 0;
    top: 69px;
    width: 320px;
    height: 0;
    max-height: calc(100vh - 100px);
    max-width: 100vw;
    margin: 0 auto;
    list-style: none;
    padding: 0;
    background: white;
    z-index: 1000;
    overflow: scroll;
    transition: height 1s ease-out;
    opacity: 0;
  }
  .pages-toc__list li {
    border-bottom: 1px solid #555555;
    padding: 0;
    margin: 0;
  }
  .pages-toc__list li:hover {
    background: #e4f4ff;
  }
  .pages-toc__list a,
  .pages-toc__list a:link,
  .pages-toc__list a:visited {
    text-decoration: none;
    color: inherit;
    display: block;
    width: 100%;
    height: 100%;
    padding: 8px 20px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .pages-toc__overlay {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    background: #555555;
    width: 100%;
    height: 100%;
    z-index: 999;
    opacity: 0.5;
  }

  .pages-toc #toc-toggle {
    display: none;
  }
  .pages-toc #toc-toggle:checked + .pages-toc__list {
    height: auto;
    opacity: 1;
  }
  .pages-toc #toc-toggle:checked ~ .pages-toc__overlay {
    display: block;
  }

  .pages-toc label[for='toc-toggle'] {
    display: block;
    width: 27px;
    height: 27px;
    margin: 5px 0 5px 20px;
    background: repeating-linear-gradient(
      #555555 2px,
      #555555 5px,
      transparent 5px,
      transparent 12px
    );
  }
  .pages-toc label[for='toc-toggle']:hover {
    opacity: 0.7;
  }

  .side-slider {
    position: absolute;
    z-index: 1001;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    -webkit-transition: all 0.6s ease-out;
    transition: all 0.6s ease-out;
    color: white;
    font-size: 13px;
    top: 0;
    margin: 0;
    left: -240px;
    background-color: #323232;
    width: 240px;
    min-height: 100%;
    padding: 20px;
  }
  .side-slider h3 {
    color: white;
  }
  .side-slider .close {
    font-size: 22px;
    color: white;
    text-shadow: none;
    opacity: 0.9;
    display: block;
    position: absolute;
    top: 10px;
    right: 15px;
  }
  .side-slider__button-bar {
    margin: 20px 0 33px 0;
  }
  .side-slider__toggle {
    font-family: arial, sans-serif;
    position: fixed;
    top: 50%;
    margin: 0;
    padding: 0;
    height: 50px;
    width: 6px;
    background: none;
    border-top: 2px solid;
    border-bottom: 2px solid;
    font-size: 20px;
    line-height: 30px;
  }
  .side-slider__toggle.open {
    border-left: none;
    border-right: 3px solid;
    border-color: #888888;
    left: 8px;
    z-index: 10;
  }
  .side-slider__toggle.open:hover {
    border-color: #000000;
  }
  .side-slider__toggle.close {
    -webkit-transition: all 0.6s ease-out;
    transition: all 0.6s ease-out;
    opacity: 1;
    left: -10px;
    border-right: none;
    border-left: 3px solid;
    border-color: #999999;
    z-index: 1001;
  }
  .side-slider__toggle.close:hover {
    border-color: #ffffff;
  }
  .side-slider__app-version {
    margin-top: 40px;
    color: #666;
    font-size: 10px;
    text-align: center;
    border-top: #666 solid 1px;
    padding: 2px 0;
  }
  .side-slider__app-version:hover {
    color: white;
    font-weight: bold;
  }
  .side-slider__advanced__button {
    width: 100%;
    padding: 10px;
    height: 40px;
  }

  .show-side-slider .side-slider {
    -webkit-transform: translate(240px, 0);
    -moz-transform: translate(240px, 0);
    -o-transform: translate(240px, 0);
    transform: translate(240px, 0);
    -webkit-transition: all 0.6s ease-out;
    transition: all 0.6s ease-out;
  }
  .show-side-slider .side-slider__toggle.close {
    -webkit-transform: translate(240px, 0);
    -moz-transform: translate(240px, 0);
    -o-transform: translate(240px, 0);
    transform: translate(240px, 0);
  }

  .show-side-slider .slider-overlay {
    z-index: 999;
    display: block;
  }

  .record-list__button-bar {
    margin-top: 30px;
  }

  .record-list__button-bar__button {
    width: 100%;
    padding: 10px;
  }

  .record-list__button-bar__button.export {
    display: block;
    padding: 2px;
    font-size: 13px;
    background: none;
    color: white;
  }
  .record-list__button-bar__button.export:hover {
    background: #626262;
    color: white;
  }

  .record-list__upload-progress {
    visibility: hidden;
    width: 100%;
  }

  .record-list__records {
    list-style-type: none;
    padding: 0;
    margin-left: 0;
    margin-top: 0;
  }
  .record-list__records__record {
    padding: 2px 5px;
    margin: 5px 0 2px 0;
    border: 1px solid white;
    word-break: break-word;
  }
  .record-list__records__record.success {
    opacity: 0.6;
    border-width: 2px;
    border-color: green;
  }
  .record-list__records__record.ongoing {
    border-width: 2px;
    border-color: orange;
  }
  .record-list__records__record.error {
    cursor: pointer;
    border-width: 2px;
    border-color: red;
  }
  .record-list__records__record[data-draft='true'] {
    cursor: pointer;
    border-color: #999999;
    border-style: dotted;
    color: #eeeeee;
  }
  .record-list__records__record[data-draft='true']:hover,
  .record-list__records__record[data-draft='true'].active {
    background: #666666;
    color: white;
  }
  .record-list__records__record[data-draft='true']::before {
    float: right;
    color: #aaaaaa;
  }
  .record-list__records__record[data-draft='true']:hover::before {
    color: white;
  }
  .record-list__records__record[data-draft='true'].active::before {
    color: white;
  }
  .record-list__records__msg {
    padding: 0 5px;
    line-height: 15px;
  }
  .record-list__records__msg.success {
    color: green;
  }
  .record-list__records__msg.ongoing {
    color: orange;
  }
  .record-list__records__msg.error {
    color: red;
  }
  .record-list__records--none {
    text-align: center;
    margin-bottom: 35px;
    font-style: italic;
  }

  [dir='rtl'] .record-list__records__record[data-draft='true']::before {
    float: left;
  }

  /** hide stuff **/
  .or [lang]:not(.active),
  .or-option-translations,
  .or-appearance-page-break,
  .or-constraint-msg,
  .or-required-msg,
  .or-relevant-msg,
  .option-wrapper .itemset-template,
  .itemset-labels,
  .or-hint.or-form-guidance,
  .or-hint.or-form-guidance.active {
    display: none;
  }

  .or > h3,
  .or-group > h3 {
    padding: 5px 0 15px 0;
    word-wrap: break-word;
    color: #ee7325;
    text-align: center;
  }

  .or > h4,
  .or-group > h4 {
    text-align: inherit;
    margin-top: 9px;
    margin-bottom: 9px;
    /*color: #ee7325; */
    color: #ee7325;
  }
  .or > h4 strong,
  .or-group > h4 strong {
    font-size: inherit;
  }

  .or.hide {
    display: none;
  }

  .or .question-label h1,
  .or .question-label h2,
  .or .question-label h3,
  .or .question-label h4,
  .or .question-label h5,
  .or .question-label h6,
  .or .or-hint h1,
  .or .or-hint h2,
  .or .or-hint h3,
  .or .or-hint h4,
  .or .or-hint h5,
  .or .or-hint h6 {
    margin-top: 10px;
    margin-bottom: 10px;
  }
  .or .question-label h1:first-child,
  .or .question-label h2:first-child,
  .or .question-label h3:first-child,
  .or .question-label h4:first-child,
  .or .question-label h5:first-child,
  .or .question-label h6:first-child,
  .or .or-hint h1:first-child,
  .or .or-hint h2:first-child,
  .or .or-hint h3:first-child,
  .or .or-hint h4:first-child,
  .or .or-hint h5:first-child,
  .or .or-hint h6:first-child {
    margin-top: 0;
  }
  .or .question-label h1:last-child,
  .or .question-label h2:last-child,
  .or .question-label h3:last-child,
  .or .question-label h4:last-child,
  .or .question-label h5:last-child,
  .or .question-label h6:last-child,
  .or .or-hint h1:last-child,
  .or .or-hint h2:last-child,
  .or .or-hint h3:last-child,
  .or .or-hint h4:last-child,
  .or .or-hint h5:last-child,
  .or .or-hint h6:last-child {
    margin-bottom: 0;
  }

  .or .question-label {
    word-break: break-word;
    display: inline-block;
  }

  /** hints **/
  .or-hint.active {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    color: #888888;
    display: block;
    line-height: 16px;
    font-weight: normal;
    font-size: 11px;
    font-style: italic;
    padding-top: 5px;
  }
  .or-hint.active ~ br {
    display: none;
  }

  .or .form-logo {
    display: block;
    text-align: center;
    width: 100%;
  }
  .or .form-logo img {
    float: none;
    display: inline;
    max-height: 200px;
    max-width: 120px;
  }

  .or-repeat {
    background-color: #fef5ef;
    margin: 0 0 3px 0;
    padding: 20px 10px 10px 10px;
    position: relative;
  }
  .or-repeat:empty {
    padding: 0;
  }
  .or-repeat .repeat-number {
    display: block;
    position: absolute;
    top: 7px;
    right: 10px;
    /*color: #ee7325; */
    color: #ee7325;
  }
  .or-repeat .repeat-number + .or-group {
    border-top: none;
  }
  .or-repeat .or-repeat {
    background-color: white;
  }
  .or-repeat .or-repeat .or-repeat {
    background-color: #fef5ef;
  }
  .or-repeat .or-repeat .or-repeat .or-repeat {
    background-color: white;
  }

  .or-group {
    border-top: 3px solid #bbbbbb;
    margin: 1.5em 0 0.4em 0;
  }
  .or-group .or-group {
    margin: 1.5em 0 0.5em 0;
  }
  .or-group .or-group > h4 .active {
    font-size: 80%;
  }
  .or-group .or-group > h4 .active::before {
    content: '\00BB  ';
  }
  .or-group .or-group .or-group > h4 .active::before {
    content: '\00BB  \00BB  ';
  }
  .or-group .or-group .or-group .or-group > h4 .active::before {
    content: '\00BB  \00BB  \00BB  ';
  }
  .or-group .or-group .or-group .or-group .or-group > h4 .active::before {
    content: '\00BB  \00BB  \00BB  \00BB';
  }
  .or-group
    .or-group
    .or-group
    .or-group
    .or-group
    .or-group
    > h4
    .active::before {
    content: '\00BB  \00BB  \00BB  \00BB  \00BB';
  }
  .or-group
    .or-group
    .or-group
    .or-group
    .or-group
    .or-group
    .or-group
    > h4
    .active::before {
    content: '\00BB  \00BB  \00BB  \00BB  \00BB  \00BB';
  }

  .or-group:not(.or-appearance-no-collapse) > h4 {
    position: relative;
    pointer-events: none;
  }
  .or-group:not(.or-appearance-no-collapse) > h4::before {
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-top: 12px solid #026cb6;
    border-bottom: 0;
    display: block;
    position: absolute;
    content: '';
    top: 5px;
    left: -30px;
    right: -30px;
    pointer-events: all;
  }

  .or-group:not(.or-appearance-no-collapse).or-appearance-compact > h4::before {
    width: 0;
    height: 0;
    border-top: 12px solid transparent;
    border-bottom: 12px solid transparent;
    border-left: 12px solid #026cb6;
    border-right: 0;
    left: -22px;
    right: -22px;
    top: 0;
  }

  .or-group:not(.or-appearance-no-collapse).or-appearance-compact > h4 ~ * {
    display: none !important;
  }

  [dir='rtl']
    .or-group:not(.or-appearance-no-collapse).or-appearance-compact
    > h4::before {
    border-left: 0;
    /*border-right: 12px solid #ee7325; */
    border-right: 12px solid blue;
  }

  #stats + .or-group,
  #or-preload-items + .or-group,
  #form-languages + .or-group {
    border-top: none;
  }

  .question:not(.readonly) {
    font-weight: bold;
  }

  .question {
    display: block;
    margin: 0 0 9px 0;
    padding-top: 15px;
    border: none;
    position: relative;
  }
  .question > fieldset {
    padding: 0;
    margin: 0;
    border: none;
  }

  .question-label strong {
    font-size: 17px;
  }

  .question > img,
  .question > video,
  .question > audio {
    margin: 10px auto 10px;
  }

  .question.readonly input[readonly].empty,
  .question.readonly select[readonly].empty,
  .question.readonly textarea[readonly].empty {
    display: none;
  }

  .question.readonly strong {
    font-size: inherit;
  }

  label,
  legend {
    font-size: 16px;
  }

  .or img,
  .or audio,
  .or video {
    display: block;
    max-height: 300px;
    max-width: 70%;
  }

  .or video {
    max-width: 100%;
  }

  legend {
    display: block;
    position: relative;
    border: none;
    width: 100%;
    padding: 0;
    margin-bottom: 12px;
  }

  .option-wrapper {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .option-wrapper > label {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    display: block;
    margin: 0;
    cursor: pointer;
    padding: 4px;
    margin: 0 10px 1px 10px;
    flex-basis: 98%;
    flex-grow: 0;
  }
  .option-wrapper > label:hover:not(.filler) {
    background-color: #e4f4ff;
  }
  .option-wrapper > label:before,
  .option-wrapper > label:after {
    content: ' ';
    display: table;
  }
  .option-wrapper > label:after {
    clear: both;
  }
  .option-wrapper .option-label {
    margin-left: 30px;
    display: block;
  }
  .option-wrapper img,
  .option-wrapper video,
  .option-wrapper audio {
    float: right;
    margin: 10px 0 10px 10px;
  }

  .or[dir='rtl'] .option-wrapper .option-label {
    margin-right: 30px;
  }

  .or[dir='rtl'] .option-wrapper img,
  .or[dir='rtl'] .option-wrapper video,
  .or[dir='rtl'] .option-wrapper audio {
    float: left;
    margin: 10px 10px 10px 0;
  }

  .touch .question.simple-select .option-wrapper > label {
    background-color: transparent;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: auto;
    margin: 0 0 6.4px 0;
    padding: 10px;
  }
  .touch .question.simple-select .option-wrapper > label input[type='radio'],
  .touch
    .question.simple-select
    .option-wrapper
    > label
    input[type='checkbox'] {
    margin-left: 5px;
  }
  .touch .question.simple-select .option-wrapper > label:focus,
  .touch .question.simple-select .option-wrapper > label:hover,
  .touch .question.simple-select .option-wrapper > label:active {
    background-color: #e4f4ff;
  }

  .touch input[type='text'],
  .touch input[type='tel'],
  .touch input[type='password'],
  .touch input[type='url'],
  .touch input[type='email'],
  .touch input[type='file'],
  .touch input[type='date'],
  .touch input[type='month'],
  .touch input[type='time'],
  .touch input[type='datetime'],
  .touch input[type='number'],
  .touch textarea,
  .touch select {
    margin: 10px 0 10px 0;
    color: #104b66;
  }

  .touch input[type='text'],
  .touch input[type='tel'],
  .touch input[type='password'],
  .touch input[type='url'],
  .touch input[type='email'],
  .touch input[type='file'],
  .touch input[type='date'],
  .touch input[type='month'],
  .touch input[type='time'],
  .touch input[type='datetime'],
  .touch input[type='number'],
  .touch textarea {
    border: 1px solid #ddd8ce;
  }

  .touch select {
    width: 100%;
  }

  input[type='text'],
  input[type='tel'],
  input[type='password'],
  input[type='url'],
  input[type='email'],
  input[type='file'],
  input[type='date'],
  input[type='month'],
  input[type='time'],
  input[type='datetime'],
  input[type='number'],
  input[type='range'],
  textarea,
  select,
  .widget {
    display: block;
    margin: 8px 0 8px 0;
  }

  input:not([type='radio']):not([type='checkbox']),
  textarea {
    height: 34px;
  }

  select {
    width: 80%;
  }

  .question input[type='text'],
  .question input[type='tel'],
  .question input[type='password'],
  .question input[type='url'],
  .question input[type='email'],
  .question input[type='file'] {
    width: 80%;
  }

  .question input[type='date'],
  .question input[type='month'],
  .question input[type='number'],
  .question input[type='time'],
  .question input[type='datetime'],
  .question input[type='text'].mask-date {
    width: 144px;
  }

  .question input[type='radio'],
  .question input[type='checkbox'] {
    float: left;
    display: block;
    margin-top: 2px;
  }

  .or[dir='rtl'] .question input[type='radio'],
  .or[dir='rtl'] .question input[type='checkbox'] {
    float: right;
  }

  .question textarea {
    width: 80%;
    resize: vertical;
    min-height: 9em;
  }

  .or-repeat .repeat-buttons {
    margin-top: 30px;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-end;
  }

  .or-repeat .remove {
    margin-bottom: 0;
    margin-right: 0;
  }

  .or-repeat-info:not(:empty) {
    padding-top: 10px;
  }

  .add-repeat-btn {
    display: block;
    margin: 0 auto 10px auto;
    min-width: 150px;
  }

  .or[dir='rtl'] .remove {
    float: left;
  }

  .alert {
    margin-bottom: 4px;
  }

  .required {
    position: absolute;
    top: 10px;
    left: -10px;
    /*color: #ee7325; */
    /*color: #ee7325;*/
    color: red;
  }

  legend .required {
    top: 0;
  }

  .or[dir='rtl'] .required {
    left: auto;
    right: -10px;
  }

  .disabled {
    opacity: 0.5;
  }

  .invalid-constraint,
  .invalid-required,
  .invalid-relevant {
    -webkit-transition: all 0.6s ease-out;
    transition: all 0.6s ease-out;
    background-color: #f2dede;
    border-color: #ebccd1;
    border-radius: 3px;
    margin-right: -10px;
    margin-left: -10px;
    padding-left: 10px;
    padding-right: 10px;
    padding-bottom: 10px;
  }

  .invalid-constraint .or-constraint-msg.active,
  .invalid-constraint .file-picker .file-feedback.error,
  .file-picker .invalid-constraint .file-feedback.error,
  .invalid-constraint .draw-widget__feedback,
  .invalid-constraint .image-map__error,
  .invalid-required .or-required-msg.active,
  .invalid-required .file-picker .file-feedback.warning,
  .file-picker .invalid-required .file-feedback.warning,
  .question.invalid-relevant .or-relevant-msg.active {
    display: block;
  }

  .or-required-msg.active,
  .file-picker .file-feedback.warning,
  .or-constraint-msg.active,
  .file-picker .file-feedback.error,
  .draw-widget__feedback,
  .image-map__error,
  .or-relevant-msg.active {
    font-weight: bold;
    padding-top: 5px;
    font-size: 0.85em;
    color: #a94442;
  }

  .or-branch.disabled,
  .or-branch.or-branch.pre-init {
    display: none;
  }

  @media screen and (max-width: 1100px) {
    body {
      padding: 0 !important;
      margin: 0;
    }
    .main {
      margin: 0;
      padding: 0;
    }
    .preview-header {
      top: -5px;
    }
    .paper {
      border-radius: 0;
      padding-top: 0;
    }
    .form-header {
      position: relative;
      top: 0;
      padding: 0 14px;
      border-bottom: 1px solid #bbbbbb;
      min-height: 0;
      margin-left: -45px;
      margin-right: -45px;
      width: calc(100% + (2 * 45px));
    }
    .form-header .form-language-selector {
      padding-top: 16px;
      padding-bottom: 16px;
    }
    .form-header .form-language-selector span {
      display: none;
    }
    #form-title {
      padding-top: 25px;
    }
  }

  @media screen and (max-width: 600px) {
    body {
      line-height: 1.3125;
    }
    .or-group:not(.or-appearance-no-collapse) > h4 {
      margin-left: 8px;
    }
    .touch .question.simple-select .option-wrapper > label {
      padding: 10px 5px;
    }
    .main .paper {
      padding: 0 30px 30px 30px;
    }
    .form-header {
      margin-left: -30px;
      margin-right: -30px;
      width: calc(100% + (2 * 30px));
    }
    .form-footer {
      margin: 30px -30px -30px -30px;
    }
  }

  @media screen and (max-width: 400px) {
    body {
      line-height: 1.3625;
    }
    input[type='text'],
    input[type='password'],
    input[type='url'],
    input[type='email'],
    input[type='date'],
    input[type='number'],
    input[type='time'],
    input[type='datetime'],
    input[type='file'] {
      width: 100%;
    }
    select,
    textarea {
      width: 100%;
    }
    .or-group:not(.or-appearance-no-collapse) > h4 {
      margin-left: 15px;
    }
    .main .paper {
      padding: 0 20px 20px 20px;
    }
    .form-header {
      margin-left: -20px;
      margin-right: -20px;
      width: calc(100% + (2 * 20px));
    }
    .form-header .form-language-selector {
      border-right: none;
    }
    .form-footer {
      margin: 20px -20px -20px -20px;
    }
  }

  .bootstrap-select {
    margin-top: 15px;
  }
  .bootstrap-select .dropdown-toggle {
    width: 218.99632px;
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    text-align: left;
  }
  .bootstrap-select .dropdown-toggle .caret {
    position: absolute;
    top: 14px;
    right: 12px;
  }
  .bootstrap-select .dropdown-toggle .selected {
    width: calc(100% - 12px);
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bootstrap-select .dropdown-toggle ~ .dropdown-menu {
    max-height: 200px;
    max-width: 100%;
    overflow: auto;
  }
  .bootstrap-select .dropdown-toggle ~ .dropdown-menu .option-wrapper {
    padding-left: 5px;
    background-color: transparent;
    color: black;
    text-decoration: none;
  }
  .bootstrap-select .dropdown-toggle ~ .dropdown-menu .option-wrapper label {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    padding-top: 2px;
    padding-bottom: 2px;
    padding-left: 0px;
    font-size: 16px;
  }
  .bootstrap-select
    .dropdown-toggle
    ~ .dropdown-menu
    .option-wrapper
    label:hover {
    background: transparent;
  }
  .bootstrap-select
    .dropdown-toggle
    ~ .dropdown-menu
    .option-wrapper
    label
    .option-label {
    margin-top: 1px;
  }

  .readonly .bootstrap-select .dropdown-toggle {
    opacity: 0.7;
  }

  .or[dir='rtl'] .bootstrap-select .dropdown-toggle {
    text-align: right;
  }
  .or[dir='rtl'] .bootstrap-select .dropdown-toggle .caret {
    margin-left: 0;
    margin-right: 10px;
    left: 12px;
    right: auto;
  }

  .btn-group {
    position: relative;
    vertical-align: middle;
  }
  .btn-group > .btn,
  .vex.vex-theme-plain .btn-group > .vex-dialog-button {
    position: relative;
  }
  .btn-group > .btn:hover,
  .vex.vex-theme-plain .btn-group > .vex-dialog-button:hover,
  .btn-group > .btn:focus,
  .vex.vex-theme-plain .btn-group > .vex-dialog-button:focus,
  .btn-group > .btn:active,
  .vex.vex-theme-plain .btn-group > .vex-dialog-button:active,
  .btn-group > .btn.active,
  .vex.vex-theme-plain .btn-group > .active.vex-dialog-button {
    z-index: 2;
  }

  .btn-group .dropdown-toggle:active,
  .btn-group.open .dropdown-toggle {
    outline: 0;
  }

  .btn-group.open .dropdown-toggle {
    -webkit-box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
    box-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  }
  .btn-group.open .dropdown-toggle.btn-link {
    -webkit-box-shadow: none;
    box-shadow: none;
  }

  .btn .caret,
  .vex.vex-theme-plain .vex-dialog-button .caret {
    margin-left: 0;
  }

  .mobileselect {
    margin-left: 10px;
  }

  /*
  	 CSS-Tricks Example
  	 by Chris Coyier
  	 http://css-tricks.com
  */
  .datalist {
    list-style: none;
    display: none;
    background: white;
    position: absolute;
    left: 0;
    top: 0;
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
    padding: 0;
    border: 1px solid #555555;
  }

  .datalist:empty {
    display: none !important;
  }

  .datalist li {
    padding: 5px;
  }

  .datalist li.active {
    background: #3875d7;
    color: white;
  }

  input[type='text'].autocomplete {
    width: 218.99632px;
  }
  input[type='text'].autocomplete.notfound {
    color: #999999;
  }

  .touch input[type='text'].autocomplete {
    width: 100%;
  }

  .enketo-geopoint-marker {
    margin-top: -24px;
    width: 24px;
    height: 24px;
    font-size: 24px;
    font-style: normal;
    font-weight: 400;
    line-height: 1;
    text-align: center;
    color: #508ecd;
  }

  .enketo-area-popup .leaflet-popup-content-wrapper {
    border-radius: 2px;
    color: black;
    background: none;
    box-shadow: none;
  }

  .enketo-area-popup .leaflet-popup-content {
    margin: 3px 20px;
  }

  .enketo-area-popup .leaflet-popup-tip-container {
    display: none;
  }

  .leaflet-container .enketo-area-popup:hover a.leaflet-popup-close-button {
    display: block;
  }

  .leaflet-container .enketo-area-popup a.leaflet-popup-close-button {
    z-index: 1;
    display: none;
    font-weight: normal;
    color: black;
  }

  .enketo-geopoint-circle-marker,
  .geopicker .point {
    width: 16px;
    height: 16px;
    margin-top: -8px;
    border-radius: 8px;
    border: 1px solid #4e4e4e;
    background: #818181;
  }

  .enketo-geopoint-circle-marker-active,
  .geopicker .point.active {
    width: 16px;
    height: 16px;
    margin-top: -8px;
    border-radius: 8px;
    border: 1px solid #508ecd;
    background: #9fc1e4;
  }

  .geopicker {
    margin-top: 25px;
  }
  .geopicker img {
    margin: 0;
    max-height: none;
    max-width: none;
  }
  .geopicker .geo-inputs {
    position: relative;
    min-width: 160px;
    width: 27%;
    margin: 0 4% 0 0;
  }
  @media screen and (max-width: 1100px) {
    .geopicker .geo-inputs {
      width: 100%;
    }
  }
  .geopicker .geo-inputs .paste-progress,
  .geopicker .geo-inputs .disabled-msg {
    position: absolute;
    display: block;
    top: 50%;
    width: calc(100% - 20px);
    text-align: center;
    margin: 0px 10px;
  }
  .geopicker .geo-inputs .disabled-msg {
    display: none;
    color: #a94442;
  }
  .geopicker .map-canvas-wrapper {
    position: relative;
  }
  .geopicker .map-canvas-wrapper,
  .geopicker .search-bar {
    width: 65%;
    float: right;
    padding-left: 4%;
    border-left: solid 1px #bbbbbb;
  }
  @media screen and (max-width: 1100px) {
    .geopicker .map-canvas-wrapper,
    .geopicker .search-bar {
      width: 100%;
      float: none;
      padding-left: 0;
      border-left: none;
    }
  }
  .geopicker .search-bar {
    margin-top: 0;
    display: flex;
    justify-content: space-between;
  }
  .geopicker .search-bar .input-group {
    display: flex;
    width: 80%;
    order: 2;
  }
  .geopicker .search-bar [name='search'] {
    margin: 0 !important;
    width: calc(100% - 40px);
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  .geopicker .search-bar .hide-map-btn {
    display: none;
  }
  .geopicker .search-bar .search-btn {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-left: 0;
  }
  .geopicker .btn:not(.close-chain-btn):not(.toggle-input-type-btn),
  .geopicker
    .vex.vex-theme-plain
    .vex-dialog-button:not(.close-chain-btn):not(.toggle-input-type-btn),
  .vex.vex-theme-plain
    .geopicker
    .vex-dialog-button:not(.close-chain-btn):not(.toggle-input-type-btn) {
    height: 34px;
  }
  .geopicker .btn[name='geodetect'],
  .geopicker .vex.vex-theme-plain .vex-dialog-button[name='geodetect'],
  .vex.vex-theme-plain .geopicker .vex-dialog-button[name='geodetect'] {
    font-size: 16px;
    margin: 0 0 0 4%;
    order: 3;
  }
  .geopicker .close-chain-btn {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    display: inline-block;
    padding: 0 5px;
    margin-left: 15px;
  }
  .geopicker .toggle-input-visibility-btn {
    position: absolute;
    top: calc(50% - 15px);
    left: -16px;
    background: none;
    border-left: 3px solid #aaaaaa;
    border-bottom: 2px solid #aaaaaa;
    border-top: 2px solid #aaaaaa;
    border-right: none;
    height: 30px;
    width: 7px;
    padding: 0;
    z-index: 10;
  }
  .geopicker .toggle-input-visibility-btn.open {
    left: -20px;
    border-left: none;
    border-right: 3px solid #aaaaaa;
  }
  .geopicker .points {
    width: 100%;
    padding-bottom: 15px;
  }
  .geopicker .point {
    margin-right: 10px;
    display: inline-block;
    opacity: 0.9;
  }
  .geopicker .point.has-error:not(.active) {
    border: 1px solid #a94442;
    background: #f2dede;
    opacity: 1;
  }
  .geopicker .addpoint {
    border: none;
    background: none;
    height: 16px;
    width: 16px;
    font-weight: bold;
    font-size: 16px;
    padding: 0;
    vertical-align: top;
    line-height: 16px;
    margin: 0;
    display: inline-block;
    margin-top: -1px;
  }
  .geopicker .hide-search.no-map {
    border-left: none;
  }
  .geopicker .hide-search .input-group {
    display: none;
  }
  .geopicker .hide-search .btn[name='geodetect'],
  .geopicker
    .hide-search
    .vex.vex-theme-plain
    .vex-dialog-button[name='geodetect'],
  .vex.vex-theme-plain
    .geopicker
    .hide-search
    .vex-dialog-button[name='geodetect'] {
    margin: 15px auto 15px auto;
    width: 50%;
  }
  .geopicker label.geo {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    display: block;
    border: none;
    padding: 0;
    margin: 15px 0 0 0;
  }
  .geopicker label.geo.lat,
  .geopicker label.geo.kml {
    padding-top: 5px;
  }
  .geopicker label.geo.long {
    margin-bottom: 20px;
  }
  .geopicker label.geo.alt {
    border-top: solid 1px #bbbbbb;
    padding: 12px 0 0 0;
    margin: 0 0 0 0;
  }
  @media screen and (max-width: 1100px) {
    .geopicker label.geo.alt {
      border-top: none;
    }
  }
  .geopicker label.geo.acc {
    padding: 0;
    margin: 5px 0 0 0;
  }
  .geopicker label.geo.alt,
  .geopicker label.geo.acc {
    min-height: 70px;
    line-height: 50px;
    font-size: 12px;
  }
  .geopicker input[name='lat'],
  .geopicker input[name='long'],
  .geopicker textarea[name='kml'] {
    float: none;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    width: 100%;
    /*&:invalid {
              //copied from bootstrap
              color: $state-danger-text;
              border-color: $state-danger-text;
              @include box-shadow(inset 0 1px 1px rgba(0, 0, 0, 0.075));
              // Redeclare so transitions work
              &:focus {
                  border-color: darken($state-danger-text, 10%);
                  $shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 6px lighten($state-danger-text, 20%);
                  @include box-shadow($shadow);
              }
          }*/
  }
  .geopicker input[name='alt'],
  .geopicker input[name='acc'] {
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    display: block;
    float: right;
    width: 40%;
  }
  @media screen and (max-width: 1100px) {
    .geopicker input[name='alt'],
    .geopicker input[name='acc'] {
      width: 50%;
    }
  }
  .geopicker textarea[name='kml'] {
    min-height: 260px;
    overflow: auto;
  }
  .geopicker textarea[name='kml']:disabled + .disabled-msg {
    display: block;
  }
  .geopicker .geo.kml {
    display: none;
    margin-bottom: 10px;
  }
  .geopicker .toggle-input-type-btn {
    border: none;
    background: none;
    color: #ccc;
    position: absolute;
    top: -10px;
    right: 0;
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    font-size: 12px;
  }
  .geopicker .toggle-input-type-btn .kml-input {
    display: block;
  }
  .geopicker .toggle-input-type-btn .points-input {
    display: none;
  }
  .geopicker .kml-input-mode .geo {
    display: none;
  }
  .geopicker .kml-input-mode .geo.kml {
    display: block;
  }
  .geopicker .kml-input-mode .toggle-input-type-btn .kml-input {
    display: none;
  }
  .geopicker .kml-input-mode .toggle-input-type-btn .points-input {
    display: block;
  }
  .geopicker .map-canvas {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 3px;
    margin-top: 10px;
    height: 275px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    cursor: crosshair;
  }
  .geopicker .map-canvas img {
    max-width: none;
  }
  .geopicker .map-canvas .attribution {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 10px;
  }
  .geopicker .map-canvas.static {
    cursor: not-allowed;
  }
  .geopicker .map-canvas .show-map-btn {
    width: 150px;
    margin: 120px auto;
    display: block;
  }
  .geopicker.full-screen {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    background: white;
    margin-top: 0;
    padding-top: 25px;
  }
  .geopicker.full-screen .geo-inputs {
    margin-left: 25px;
    margin-bottom: 15px;
  }
  .geopicker.full-screen .geo-inputs .geo,
  .geopicker.full-screen .geo-inputs .toggle-input-type-btn {
    display: none;
  }
  .geopicker.full-screen .geo-inputs .close-chain-btn {
    margin-left: 20px;
    margin-top: 0;
  }
  .geopicker.full-screen .map-canvas-wrapper {
    float: none;
    width: 100%;
    padding: 0 25px 15px 25px;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
  }
  .geopicker.full-screen .map-canvas-wrapper .map-canvas {
    height: 100%;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
  }
  .geopicker.full-screen .map-canvas-wrapper .show-map-btn {
    display: none;
  }
  .geopicker.full-screen .search-bar {
    width: 100%;
    padding: 0 25px 15px 25px;
  }
  .geopicker.full-screen .search-bar.hide-search {
    display: block;
  }
  .geopicker.full-screen .search-bar .hide-map-btn {
    display: block;
    width: 70px;
    margin-right: 15px;
    order: 1;
  }
  .geopicker.full-screen .search-bar [name='geodetect'] {
    width: 70px;
    margin-left: 15px;
  }
  .geopicker.full-screen .search-bar .input-group {
    width: auto;
    flex: 100%;
  }
  .geopicker.full-screen .points {
    display: none;
  }
  .geopicker.full-screen .btn-remove {
    margin-left: 0;
  }
  .geopicker .leaflet-control-layers-toggle,
  .geopicker .leaflet-retina .leaflet-control-layers-toggle {
    background: none;
    color: #888;
    text-align: center;
    font-size: 20px;
    line-height: 44px;
  }
  .geopicker .leaflet-control-layers-toggle .icon-globe,
  .geopicker .leaflet-retina .leaflet-control-layers-toggle .icon-globe {
    margin: -1px auto 0 auto;
  }
  .geopicker .leaflet-control-layers-list label {
    text-align: left;
    padding: 5px;
  }
  .geopicker .leaflet-control-layers-list label .option-label {
    margin-left: 30px;
    display: block;
    line-height: 20px;
  }
  .geopicker:not(.full-screen).hide-input.wide .map-canvas {
    height: 375px;
  }
  .geopicker:not(.full-screen).hide-input .geo-inputs .geo {
    display: none;
  }
  .geopicker:not(.full-screen).hide-input .toggle-input-type-btn {
    display: none;
  }
  .geopicker:not(.full-screen).hide-input .btn-remove {
    margin: 10px 0 5px 0;
  }
  .geopicker:not(.full-screen).hide-input .map-canvas-wrapper,
  .geopicker:not(.full-screen).hide-input .search-bar {
    width: 100%;
    border-left: none;
    padding-left: 0;
  }

  .or[dir='rtl'] .geopicker .geo-inputs {
    margin: 0 0 0 4%;
  }

  .or[dir='rtl'] .geopicker .map-canvas-wrapper,
  .or[dir='rtl'] .geopicker .search-bar {
    float: left;
    border-left: none;
    border-right: solid 1px #bbbbbb;
  }
  @media screen and (max-width: 1100px) {
    .or[dir='rtl'] .geopicker .map-canvas-wrapper,
    .or[dir='rtl'] .geopicker .search-bar {
      border-right: none;
    }
  }
  .or[dir='rtl'] .geopicker .map-canvas-wrapper .input-group,
  .or[dir='rtl'] .geopicker .search-bar .input-group {
    flex-direction: row-reverse;
  }

  .or[dir='rtl'] .geopicker .toggle-input-visibility-btn {
    right: -16px;
    border-right: 3px solid #aaaaaa;
    border-bottom: 2px solid #aaaaaa;
    border-top: 2px solid #aaaaaa;
    border-left: none;
  }
  .or[dir='rtl'] .geopicker .toggle-input-visibility-btn.open {
    right: -20px;
    border-right: none;
    border-left: 3px solid #aaaaaa;
  }

  .or[dir='rtl'] .geopicker input[name='alt'],
  .or[dir='rtl'] .geopicker input[name='acc'] {
    float: left;
  }

  .or[dir='rtl'] .geopicker .btn[name='geodetect'],
  .or[dir='rtl']
    .geopicker
    .vex.vex-theme-plain
    .vex-dialog-button[name='geodetect'],
  .vex.vex-theme-plain
    .or[dir='rtl']
    .geopicker
    .vex-dialog-button[name='geodetect'] {
    font-size: 16px;
    margin: 0 4% 0 0;
  }

  .or[dir='rtl'] .geopicker .hide-map-btn {
    margin: 0 0 0 4%;
  }

  .or[dir='rtl'] .geopicker .hide-search .btn[name='geodetect'],
  .or[dir='rtl']
    .geopicker
    .hide-search
    .vex.vex-theme-plain
    .vex-dialog-button[name='geodetect'],
  .vex.vex-theme-plain
    .or[dir='rtl']
    .geopicker
    .hide-search
    .vex-dialog-button[name='geodetect'] {
    margin: 15px auto;
    width: 50%;
  }

  .or[dir='rtl'] .geopicker .close-chain-btn {
    margin-left: 0;
    margin-right: 15px;
  }

  .or[dir='rtl'] .geopicker .toggle-input-type-btn {
    left: 0;
    right: auto;
  }

  .or[dir='rtl'] .geopicker:not(.full-screen).hide-input .map-canvas-wrapper,
  .or[dir='rtl'] .geopicker:not(.full-screen).hide-input .search-bar {
    border-right: none;
    padding-right: 4%;
    padding-left: 0;
  }

  @media screen and (max-width: 500px) {
    .full-screen.geopicker .search-bar .search-btn {
      display: none;
    }
    .full-screen.geopicker .search-bar [name='search'] {
      width: 100%;
    }
    .full-screen.geopicker .search-bar [name='search'] {
      border-top-right-radius: 4px;
      border-bottom-right-radius: 4px;
    }
  }

  .question:not(.or-appearance-label):not(.or-appearance-compact):not(.or-appearance-quickcompact)
    .geopicker
    label {
    line-height: 16px;
    font-weight: normal;
  }
  .question:not(.or-appearance-label):not(.or-appearance-compact):not(.or-appearance-quickcompact)
    .geopicker
    label
    input[type='radio']
    ~ .option-label::before {
    font-size: 16px;
    height: 16px;
    margin-right: 2px;
  }

  /* required styles for Leaflet (unchanged from https://github.com/Leaflet/Leaflet/blob/master/dist/leaflet.css) */
  .leaflet-pane,
  .leaflet-tile,
  .leaflet-marker-icon,
  .leaflet-marker-shadow,
  .leaflet-tile-container,
  .leaflet-pane > svg,
  .leaflet-pane > canvas,
  .leaflet-zoom-box,
  .leaflet-image-layer,
  .leaflet-layer {
    position: absolute;
    left: 0;
    top: 0;
  }

  .leaflet-container {
    overflow: hidden;
  }

  .leaflet-tile,
  .leaflet-marker-icon,
  .leaflet-marker-shadow {
    -webkit-user-select: none;
    -moz-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
  }

  /* Safari renders non-retina tile on retina better with this, but Chrome is worse */
  .leaflet-safari .leaflet-tile {
    image-rendering: -webkit-optimize-contrast;
  }

  /* hack that prevents hw layers "stretching" when loading new tiles */
  .leaflet-safari .leaflet-tile-container {
    width: 1600px;
    height: 1600px;
    -webkit-transform-origin: 0 0;
  }

  .leaflet-marker-icon,
  .leaflet-marker-shadow {
    display: block;
  }

  /* .leaflet-container svg: reset svg max-width decleration shipped in Joomla! (joomla.org) 3.x */
  /* .leaflet-container img: map is broken in FF if you have max-width: 100% on tiles */
  .leaflet-container .leaflet-overlay-pane svg,
  .leaflet-container .leaflet-marker-pane img,
  .leaflet-container .leaflet-shadow-pane img,
  .leaflet-container .leaflet-tile-pane img,
  .leaflet-container img.leaflet-image-layer {
    max-width: none !important;
    max-height: none !important;
  }

  .leaflet-container.leaflet-touch-zoom {
    -ms-touch-action: pan-x pan-y;
    touch-action: pan-x pan-y;
  }

  .leaflet-container.leaflet-touch-drag {
    -ms-touch-action: pinch-zoom;
    /* Fallback for FF which doesn't support pinch-zoom */
    touch-action: none;
    touch-action: pinch-zoom;
  }

  .leaflet-container.leaflet-touch-drag.leaflet-touch-zoom {
    -ms-touch-action: none;
    touch-action: none;
  }

  .leaflet-container {
    -webkit-tap-highlight-color: transparent;
  }

  .leaflet-container a {
    -webkit-tap-highlight-color: rgba(51, 181, 229, 0.4);
  }

  .leaflet-tile {
    filter: inherit;
    visibility: hidden;
  }

  .leaflet-tile-loaded {
    visibility: inherit;
  }

  .leaflet-zoom-box {
    width: 0;
    height: 0;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    z-index: 800;
  }

  /* workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=888319 */
  .leaflet-overlay-pane svg {
    -moz-user-select: none;
  }

  .leaflet-pane {
    z-index: 400;
  }

  .leaflet-tile-pane {
    z-index: 200;
  }

  .leaflet-overlay-pane {
    z-index: 400;
  }

  .leaflet-shadow-pane {
    z-index: 500;
  }

  .leaflet-marker-pane {
    z-index: 600;
  }

  .leaflet-tooltip-pane {
    z-index: 650;
  }

  .leaflet-popup-pane {
    z-index: 700;
  }

  .leaflet-map-pane canvas {
    z-index: 100;
  }

  .leaflet-map-pane svg {
    z-index: 200;
  }

  .leaflet-vml-shape {
    width: 1px;
    height: 1px;
  }

  .lvml {
    behavior: url(#default#VML);
    display: inline-block;
    position: absolute;
  }

  /* control positioning */
  .leaflet-control {
    position: relative;
    z-index: 800;
    pointer-events: visiblePainted;
    /* IE 9-10 doesn't have auto */
    pointer-events: auto;
  }

  .leaflet-top,
  .leaflet-bottom {
    position: absolute;
    z-index: 1000;
    pointer-events: none;
  }

  .leaflet-top {
    top: 0;
  }

  .leaflet-right {
    right: 0;
  }

  .leaflet-bottom {
    bottom: 0;
  }

  .leaflet-left {
    left: 0;
  }

  .leaflet-control {
    float: left;
    clear: both;
  }

  .leaflet-right .leaflet-control {
    float: right;
  }

  .leaflet-top .leaflet-control {
    margin-top: 10px;
  }

  .leaflet-bottom .leaflet-control {
    margin-bottom: 10px;
  }

  .leaflet-left .leaflet-control {
    margin-left: 10px;
  }

  .leaflet-right .leaflet-control {
    margin-right: 10px;
  }

  /* zoom and fade animations */
  .leaflet-fade-anim .leaflet-tile {
    will-change: opacity;
  }

  .leaflet-fade-anim .leaflet-popup {
    opacity: 0;
    -webkit-transition: opacity 0.2s linear;
    -moz-transition: opacity 0.2s linear;
    -o-transition: opacity 0.2s linear;
    transition: opacity 0.2s linear;
  }

  .leaflet-fade-anim .leaflet-map-pane .leaflet-popup {
    opacity: 1;
  }

  .leaflet-zoom-animated {
    -webkit-transform-origin: 0 0;
    -ms-transform-origin: 0 0;
    transform-origin: 0 0;
  }

  .leaflet-zoom-anim .leaflet-zoom-animated {
    will-change: transform;
  }

  .leaflet-zoom-anim .leaflet-zoom-animated {
    -webkit-transition: -webkit-transform 0.25s cubic-bezier(0, 0, 0.25, 1);
    -moz-transition: -moz-transform 0.25s cubic-bezier(0, 0, 0.25, 1);
    -o-transition: -o-transform 0.25s cubic-bezier(0, 0, 0.25, 1);
    transition: transform 0.25s cubic-bezier(0, 0, 0.25, 1);
  }

  .leaflet-zoom-anim .leaflet-tile,
  .leaflet-pan-anim .leaflet-tile {
    -webkit-transition: none;
    -moz-transition: none;
    -o-transition: none;
    transition: none;
  }

  .leaflet-zoom-anim .leaflet-zoom-hide {
    visibility: hidden;
  }

  .leaflet-interactive {
    cursor: pointer;
  }

  .leaflet-grab {
    cursor: -webkit-grab;
    cursor: -moz-grab;
  }

  .leaflet-crosshair,
  .leaflet-crosshair .leaflet-interactive {
    cursor: crosshair;
  }

  .leaflet-popup-pane,
  .leaflet-control {
    cursor: auto;
  }

  .leaflet-dragging .leaflet-grab,
  .leaflet-dragging .leaflet-grab .leaflet-interactive,
  .leaflet-dragging .leaflet-marker-draggable {
    cursor: move;
    cursor: -webkit-grabbing;
    cursor: -moz-grabbing;
  }

  .leaflet-marker-icon,
  .leaflet-marker-shadow,
  .leaflet-image-layer,
  .leaflet-pane > svg path,
  .leaflet-tile-container {
    pointer-events: none;
  }

  .leaflet-marker-icon.leaflet-interactive,
  .leaflet-image-layer.leaflet-interactive,
  .leaflet-pane > svg path.leaflet-interactive {
    pointer-events: visiblePainted;
    /* IE 9-10 doesn't have auto */
    pointer-events: auto;
  }

  .leaflet-container {
    background: #ddd;
    outline: 0;
  }

  .leaflet-container a {
    color: #0078a8;
  }

  .leaflet-container a.leaflet-active {
    outline: 2px solid orange;
  }

  .leaflet-zoom-box {
    border: 2px dotted #38f;
    background: rgba(255, 255, 255, 0.5);
  }

  .leaflet-container {
    font: 12px/1.5 'Helvetica Neue', Arial, Helvetica, sans-serif;
  }

  .leaflet-bar {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
    border-radius: 4px;
  }

  .leaflet-bar a,
  .leaflet-bar a:hover {
    background-color: #fff;
    border-bottom: 1px solid #ccc;
    width: 26px;
    height: 26px;
    line-height: 26px;
    display: block;
    text-align: center;
    text-decoration: none;
    color: black;
  }

  .leaflet-bar a,
  .leaflet-control-layers-toggle {
    background-position: 50% 50%;
    background-repeat: no-repeat;
    display: block;
  }

  .leaflet-bar a:hover {
    background-color: #f4f4f4;
  }

  .leaflet-bar a:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }

  .leaflet-bar a:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    border-bottom: none;
  }

  .leaflet-bar a.leaflet-disabled {
    cursor: default;
    background-color: #f4f4f4;
    color: #bbb;
  }

  .leaflet-touch .leaflet-bar a {
    width: 30px;
    height: 30px;
    line-height: 30px;
  }

  .leaflet-touch .leaflet-bar a:first-child {
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;
  }

  .leaflet-touch .leaflet-bar a:last-child {
    border-bottom-left-radius: 2px;
    border-bottom-right-radius: 2px;
  }

  .leaflet-control-zoom-in,
  .leaflet-control-zoom-out {
    font: bold 18px 'Lucida Console', Monaco, monospace;
    text-indent: 1px;
  }

  .leaflet-touch .leaflet-control-zoom-in,
  .leaflet-touch .leaflet-control-zoom-out {
    font-size: 22px;
  }

  .leaflet-control-layers {
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.4);
    background: #fff;
    border-radius: 5px;
  }

  .leaflet-control-layers-toggle {
    // background-image: url(images/layers.png);
    width: 36px;
    height: 36px;
  }

  .leaflet-retina .leaflet-control-layers-toggle {
    // background-image: url(images/layers-2x.png);
    background-size: 26px 26px;
  }

  .leaflet-touch .leaflet-control-layers-toggle {
    width: 44px;
    height: 44px;
  }

  .leaflet-control-layers .leaflet-control-layers-list,
  .leaflet-control-layers-expanded .leaflet-control-layers-toggle {
    display: none;
  }

  .leaflet-control-layers-expanded .leaflet-control-layers-list {
    display: block;
    position: relative;
  }

  .leaflet-control-layers-expanded {
    padding: 6px 10px 6px 6px;
    color: #333;
    background: #fff;
  }

  .leaflet-control-layers-scrollbar {
    overflow-y: scroll;
    overflow-x: hidden;
    padding-right: 5px;
  }

  .leaflet-control-layers-selector {
    margin-top: 2px;
    position: relative;
    top: 1px;
  }

  .leaflet-control-layers label {
    display: block;
  }

  .leaflet-control-layers-separator {
    height: 0;
    border-top: 1px solid #ddd;
    margin: 5px -10px 5px -6px;
  }

  .leaflet-default-icon-path {
    // background-image: url(images/marker-icon.png);
  }

  .leaflet-container .leaflet-control-attribution {
    background: #fff;
    background: rgba(255, 255, 255, 0.7);
    margin: 0;
  }

  .leaflet-control-attribution,
  .leaflet-control-scale-line {
    padding: 0 5px;
    color: #333;
  }

  .leaflet-control-attribution a {
    text-decoration: none;
  }

  .leaflet-control-attribution a:hover {
    text-decoration: underline;
  }

  .leaflet-container .leaflet-control-attribution,
  .leaflet-container .leaflet-control-scale {
    font-size: 11px;
  }

  .leaflet-left .leaflet-control-scale {
    margin-left: 5px;
  }

  .leaflet-bottom .leaflet-control-scale {
    margin-bottom: 5px;
  }

  .leaflet-control-scale-line {
    border: 2px solid #777;
    border-top: none;
    line-height: 1.1;
    padding: 2px 5px 1px;
    font-size: 11px;
    white-space: nowrap;
    overflow: hidden;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    background: #fff;
    background: rgba(255, 255, 255, 0.5);
  }

  .leaflet-control-scale-line:not(:first-child) {
    border-top: 2px solid #777;
    border-bottom: none;
    margin-top: -2px;
  }

  .leaflet-control-scale-line:not(:first-child):not(:last-child) {
    border-bottom: 2px solid #777;
  }

  .leaflet-touch .leaflet-control-attribution,
  .leaflet-touch .leaflet-control-layers,
  .leaflet-touch .leaflet-bar {
    box-shadow: none;
  }

  .leaflet-touch .leaflet-control-layers,
  .leaflet-touch .leaflet-bar {
    border: 2px solid rgba(0, 0, 0, 0.2);
    background-clip: padding-box;
  }

  /* popup */
  .leaflet-popup {
    position: absolute;
    text-align: center;
    margin-bottom: 20px;
  }

  .leaflet-popup-content-wrapper {
    padding: 1px;
    text-align: left;
    border-radius: 12px;
  }

  .leaflet-popup-content {
    margin: 13px 19px;
    line-height: 1.4;
  }

  .leaflet-popup-content p {
    margin: 18px 0;
  }

  .leaflet-popup-tip-container {
    width: 40px;
    height: 20px;
    position: absolute;
    left: 50%;
    margin-left: -20px;
    overflow: hidden;
    pointer-events: none;
  }

  .leaflet-popup-tip {
    width: 17px;
    height: 17px;
    padding: 1px;
    margin: -10px auto 0;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
  }

  .leaflet-popup-content-wrapper,
  .leaflet-popup-tip {
    background: white;
    color: #333;
    box-shadow: 0 3px 14px rgba(0, 0, 0, 0.4);
  }

  .leaflet-container a.leaflet-popup-close-button {
    position: absolute;
    top: 0;
    right: 0;
    padding: 4px 4px 0 0;
    border: none;
    text-align: center;
    width: 18px;
    height: 14px;
    font: 16px/14px Tahoma, Verdana, sans-serif;
    color: #c3c3c3;
    text-decoration: none;
    font-weight: bold;
    background: transparent;
  }

  .leaflet-container a.leaflet-popup-close-button:hover {
    color: #999;
  }

  .leaflet-popup-scrolled {
    overflow: auto;
    border-bottom: 1px solid #ddd;
    border-top: 1px solid #ddd;
  }

  .leaflet-oldie .leaflet-popup-content-wrapper {
    zoom: 1;
  }

  .leaflet-oldie .leaflet-popup-tip {
    width: 24px;
    margin: 0 auto;
    -ms-filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678)';
    filter: progid:DXImageTransform.Microsoft.Matrix(M11=0.70710678, M12=0.70710678, M21=-0.70710678, M22=0.70710678);
  }

  .leaflet-oldie .leaflet-popup-tip-container {
    margin-top: -1px;
  }

  .leaflet-oldie .leaflet-control-zoom,
  .leaflet-oldie .leaflet-control-layers,
  .leaflet-oldie .leaflet-popup-content-wrapper,
  .leaflet-oldie .leaflet-popup-tip {
    border: 1px solid #999;
  }

  .leaflet-div-icon {
    background: #fff;
    border: 1px solid #666;
  }

  .leaflet-tooltip {
    position: absolute;
    padding: 6px;
    background-color: #fff;
    border: 1px solid #fff;
    border-radius: 3px;
    color: #222;
    white-space: nowrap;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    pointer-events: none;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  }

  .leaflet-tooltip.leaflet-clickable {
    cursor: pointer;
    pointer-events: auto;
  }

  .leaflet-tooltip-top:before,
  .leaflet-tooltip-bottom:before,
  .leaflet-tooltip-left:before,
  .leaflet-tooltip-right:before {
    position: absolute;
    pointer-events: none;
    border: 6px solid transparent;
    background: transparent;
    content: '';
  }

  .leaflet-tooltip-bottom {
    margin-top: 6px;
  }

  .leaflet-tooltip-top {
    margin-top: -6px;
  }

  .leaflet-tooltip-bottom:before,
  .leaflet-tooltip-top:before {
    left: 50%;
    margin-left: -6px;
  }

  .leaflet-tooltip-top:before {
    bottom: 0;
    margin-bottom: -12px;
    border-top-color: #fff;
  }

  .leaflet-tooltip-bottom:before {
    top: 0;
    margin-top: -12px;
    margin-left: -6px;
    border-bottom-color: #fff;
  }

  .leaflet-tooltip-left {
    margin-left: -6px;
  }

  .leaflet-tooltip-right {
    margin-left: 6px;
  }

  .leaflet-tooltip-left:before,
  .leaflet-tooltip-right:before {
    top: 50%;
    margin-top: -6px;
  }

  .leaflet-tooltip-left:before {
    right: 0;
    margin-right: -12px;
    border-left-color: #fff;
  }

  .leaflet-tooltip-right:before {
    left: 0;
    margin-left: -12px;
    border-right-color: #fff;
  }

  .question.or-appearance-list-nolabel,
  .question.or-appearance-label {
    margin: -0.9em 0 -0.7em 0;
  }
  .question.or-appearance-list-nolabel legend,
  .question.or-appearance-label legend {
    float: left;
    border: none;
    line-height: 17px;
    width: 35%;
    min-height: 1px;
  }
  .question.or-appearance-list-nolabel .option-wrapper,
  .question.or-appearance-label .option-wrapper {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
  }
  .question.or-appearance-list-nolabel .option-wrapper label,
  .question.or-appearance-label .option-wrapper label {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    text-align: center;
    padding: 4px 0;
    word-break: break-word;
  }
  .question.or-appearance-list-nolabel .option-wrapper label .active,
  .question.or-appearance-label .option-wrapper label .active {
    margin: 0 auto;
  }
  .question.or-appearance-list-nolabel .option-label.active,
  .question.or-appearance-label .option-label.active {
    text-align: center;
  }

  .or[dir='rtl'] .question.or-appearance-list-nolabel,
  .or[dir='rtl'] .question.or-appearance-label {
    margin: -0.9em 0 -0.7em 0;
  }
  .or[dir='rtl'] .question.or-appearance-list-nolabel legend,
  .or[dir='rtl'] .question.or-appearance-label legend {
    float: right;
  }

  .or[dir='rtl'] .question.or-appearance-list-nolabel input[type='radio'],
  .or[dir='rtl'] .question.or-appearance-list-nolabel input[type='checkbox'] {
    float: none;
    margin: 0;
  }

  .question.or-appearance-list-nolabel label .active {
    display: none;
    float: none;
  }

  .question.or-appearance-list-nolabel input[type='radio'],
  .question.or-appearance-list-nolabel input[type='checkbox'] {
    float: none;
    text-align: center;
    display: inline-block;
    margin: 0;
    vertical-align: middle;
  }

  .question.or-appearance-label .option-wrapper > label {
    margin-bottom: 6px;
  }
  .question.or-appearance-label .option-wrapper > label:hover {
    background-color: transparent;
  }

  .question.or-appearance-label input[type='radio'],
  .question.or-appearance-label input[type='checkbox'] {
    display: none;
  }

  .question.or-appearance-label img {
    max-height: 30px;
    max-width: 30px;
    float: none;
  }

  .or[dir='rtl'] .question.or-appearance-label .option-wrapper > label img {
    float: none;
  }

  .datepicker {
    padding: 4px;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    direction: ltr;
  }

  .datepicker-inline {
    width: 220px;
  }

  .datepicker-rtl {
    direction: rtl;
  }

  .datepicker-rtl.dropdown-menu {
    left: auto;
  }

  .datepicker-rtl table tr td span {
    float: right;
  }

  .datepicker-dropdown {
    top: 0;
    left: 0;
  }

  .datepicker-dropdown:before {
    content: '';
    display: inline-block;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 7px solid #999;
    border-top: 0;
    border-bottom-color: rgba(0, 0, 0, 0.2);
    position: absolute;
  }

  .datepicker-dropdown:after {
    content: '';
    display: inline-block;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #fff;
    border-top: 0;
    position: absolute;
  }

  .datepicker-dropdown.datepicker-orient-left:before {
    left: 6px;
  }

  .datepicker-dropdown.datepicker-orient-left:after {
    left: 7px;
  }

  .datepicker-dropdown.datepicker-orient-right:before {
    right: 6px;
  }

  .datepicker-dropdown.datepicker-orient-right:after {
    right: 7px;
  }

  .datepicker-dropdown.datepicker-orient-bottom:before {
    top: -7px;
  }

  .datepicker-dropdown.datepicker-orient-bottom:after {
    top: -6px;
  }

  .datepicker-dropdown.datepicker-orient-top:before {
    bottom: -7px;
    border-bottom: 0;
    border-top: 7px solid #999;
  }

  .datepicker-dropdown.datepicker-orient-top:after {
    bottom: -6px;
    border-bottom: 0;
    border-top: 6px solid #fff;
  }

  .datepicker table {
    margin: 0;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .datepicker td,
  .datepicker th {
    text-align: center;
    width: 20px;
    height: 20px;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    border: none;
  }

  .table-striped .datepicker table tr td,
  .table-striped .datepicker table tr th {
    background-color: transparent;
  }

  .datepicker table tr td.day.focused,
  .datepicker table tr td.day:hover {
    background: #eee;
    cursor: pointer;
  }

  .datepicker table tr td.new,
  .datepicker table tr td.old {
    color: #999;
  }

  .datepicker table tr td.disabled,
  .datepicker table tr td.disabled:hover {
    background: 0 0;
    color: #999;
    cursor: default;
  }

  .datepicker table tr td.highlighted {
    background: #d9edf7;
    border-radius: 0;
  }

  .datepicker table tr td.today,
  .datepicker table tr td.today.disabled,
  .datepicker table tr td.today.disabled:hover,
  .datepicker table tr td.today:hover {
    background-color: #fde19a;
    background-image: -moz-linear-gradient(to bottom, #fdd49a, #fdf59a);
    background-image: -ms-linear-gradient(to bottom, #fdd49a, #fdf59a);
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#fdd49a),
      to(#fdf59a)
    );
    background-image: -webkit-linear-gradient(to bottom, #fdd49a, #fdf59a);
    background-image: -o-linear-gradient(to bottom, #fdd49a, #fdf59a);
    background-image: linear-gradient(to bottom, #fdd49a, #fdf59a);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#fdd49a', endColorstr='#fdf59a', GradientType=0);
    border-color: #fdf59a #fdf59a #fbed50;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: #000;
  }

  .datepicker table tr td.today.active,
  .datepicker table tr td.today.disabled,
  .datepicker table tr td.today.disabled.active,
  .datepicker table tr td.today.disabled.disabled,
  .datepicker table tr td.today.disabled:active,
  .datepicker table tr td.today.disabled:hover,
  .datepicker table tr td.today.disabled:hover.active,
  .datepicker table tr td.today.disabled:hover.disabled,
  .datepicker table tr td.today.disabled:hover:active,
  .datepicker table tr td.today.disabled:hover:hover,
  .datepicker table tr td.today.disabled:hover[disabled],
  .datepicker table tr td.today.disabled[disabled],
  .datepicker table tr td.today:active,
  .datepicker table tr td.today:hover,
  .datepicker table tr td.today:hover.active,
  .datepicker table tr td.today:hover.disabled,
  .datepicker table tr td.today:hover:active,
  .datepicker table tr td.today:hover:hover,
  .datepicker table tr td.today:hover[disabled],
  .datepicker table tr td.today[disabled] {
    background-color: #fdf59a;
  }

  .datepicker table tr td.today.active,
  .datepicker table tr td.today.disabled.active,
  .datepicker table tr td.today.disabled:active,
  .datepicker table tr td.today.disabled:hover.active,
  .datepicker table tr td.today.disabled:hover:active,
  .datepicker table tr td.today:active,
  .datepicker table tr td.today:hover.active,
  .datepicker table tr td.today:hover:active {
    background-color: #fbf069\9;
  }

  .datepicker table tr td.today:hover:hover {
    color: #000;
  }

  .datepicker table tr td.today.active:hover {
    color: #fff;
  }

  .datepicker table tr td.range,
  .datepicker table tr td.range.disabled,
  .datepicker table tr td.range.disabled:hover,
  .datepicker table tr td.range:hover {
    background: #eee;
    -webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
  }

  .datepicker table tr td.range.today,
  .datepicker table tr td.range.today.disabled,
  .datepicker table tr td.range.today.disabled:hover,
  .datepicker table tr td.range.today:hover {
    background-color: #f3d17a;
    background-image: -moz-linear-gradient(to bottom, #f3c17a, #f3e97a);
    background-image: -ms-linear-gradient(to bottom, #f3c17a, #f3e97a);
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#f3c17a),
      to(#f3e97a)
    );
    background-image: -webkit-linear-gradient(to bottom, #f3c17a, #f3e97a);
    background-image: -o-linear-gradient(to bottom, #f3c17a, #f3e97a);
    background-image: linear-gradient(to bottom, #f3c17a, #f3e97a);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#f3c17a', endColorstr='#f3e97a', GradientType=0);
    border-color: #f3e97a #f3e97a #edde34;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    -webkit-border-radius: 0;
    -moz-border-radius: 0;
    border-radius: 0;
  }

  .datepicker table tr td.range.today.active,
  .datepicker table tr td.range.today.disabled,
  .datepicker table tr td.range.today.disabled.active,
  .datepicker table tr td.range.today.disabled.disabled,
  .datepicker table tr td.range.today.disabled:active,
  .datepicker table tr td.range.today.disabled:hover,
  .datepicker table tr td.range.today.disabled:hover.active,
  .datepicker table tr td.range.today.disabled:hover.disabled,
  .datepicker table tr td.range.today.disabled:hover:active,
  .datepicker table tr td.range.today.disabled:hover:hover,
  .datepicker table tr td.range.today.disabled:hover[disabled],
  .datepicker table tr td.range.today.disabled[disabled],
  .datepicker table tr td.range.today:active,
  .datepicker table tr td.range.today:hover,
  .datepicker table tr td.range.today:hover.active,
  .datepicker table tr td.range.today:hover.disabled,
  .datepicker table tr td.range.today:hover:active,
  .datepicker table tr td.range.today:hover:hover,
  .datepicker table tr td.range.today:hover[disabled],
  .datepicker table tr td.range.today[disabled] {
    background-color: #f3e97a;
  }

  .datepicker table tr td.range.today.active,
  .datepicker table tr td.range.today.disabled.active,
  .datepicker table tr td.range.today.disabled:active,
  .datepicker table tr td.range.today.disabled:hover.active,
  .datepicker table tr td.range.today.disabled:hover:active,
  .datepicker table tr td.range.today:active,
  .datepicker table tr td.range.today:hover.active,
  .datepicker table tr td.range.today:hover:active {
    background-color: #efe24b\9;
  }

  .datepicker table tr td.selected,
  .datepicker table tr td.selected.disabled,
  .datepicker table tr td.selected.disabled:hover,
  .datepicker table tr td.selected:hover {
    background-color: #9e9e9e;
    background-image: -moz-linear-gradient(to bottom, #b3b3b3, grey);
    background-image: -ms-linear-gradient(to bottom, #b3b3b3, grey);
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#b3b3b3),
      to(grey)
    );
    background-image: -webkit-linear-gradient(to bottom, #b3b3b3, grey);
    background-image: -o-linear-gradient(to bottom, #b3b3b3, grey);
    background-image: linear-gradient(to bottom, #b3b3b3, grey);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#b3b3b3', endColorstr='#808080', GradientType=0);
    border-color: grey grey #595959;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: #fff;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }

  .datepicker table tr td.selected.active,
  .datepicker table tr td.selected.disabled,
  .datepicker table tr td.selected.disabled.active,
  .datepicker table tr td.selected.disabled.disabled,
  .datepicker table tr td.selected.disabled:active,
  .datepicker table tr td.selected.disabled:hover,
  .datepicker table tr td.selected.disabled:hover.active,
  .datepicker table tr td.selected.disabled:hover.disabled,
  .datepicker table tr td.selected.disabled:hover:active,
  .datepicker table tr td.selected.disabled:hover:hover,
  .datepicker table tr td.selected.disabled:hover[disabled],
  .datepicker table tr td.selected.disabled[disabled],
  .datepicker table tr td.selected:active,
  .datepicker table tr td.selected:hover,
  .datepicker table tr td.selected:hover.active,
  .datepicker table tr td.selected:hover.disabled,
  .datepicker table tr td.selected:hover:active,
  .datepicker table tr td.selected:hover:hover,
  .datepicker table tr td.selected:hover[disabled],
  .datepicker table tr td.selected[disabled] {
    background-color: grey;
  }

  .datepicker table tr td.selected.active,
  .datepicker table tr td.selected.disabled.active,
  .datepicker table tr td.selected.disabled:active,
  .datepicker table tr td.selected.disabled:hover.active,
  .datepicker table tr td.selected.disabled:hover:active,
  .datepicker table tr td.selected:active,
  .datepicker table tr td.selected:hover.active,
  .datepicker table tr td.selected:hover:active {
    background-color: #666\9;
  }

  .datepicker table tr td.active,
  .datepicker table tr td.active.disabled,
  .datepicker table tr td.active.disabled:hover,
  .datepicker table tr td.active:hover {
    background-color: #006dcc;
    background-image: -moz-linear-gradient(to bottom, #08c, #04c);
    background-image: -ms-linear-gradient(to bottom, #08c, #04c);
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#08c),
      to(#04c)
    );
    background-image: -webkit-linear-gradient(to bottom, #08c, #04c);
    background-image: -o-linear-gradient(to bottom, #08c, #04c);
    background-image: linear-gradient(to bottom, #08c, #04c);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#08c', endColorstr='#0044cc', GradientType=0);
    border-color: #04c #04c #002a80;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: #fff;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }

  .datepicker table tr td.active.active,
  .datepicker table tr td.active.disabled,
  .datepicker table tr td.active.disabled.active,
  .datepicker table tr td.active.disabled.disabled,
  .datepicker table tr td.active.disabled:active,
  .datepicker table tr td.active.disabled:hover,
  .datepicker table tr td.active.disabled:hover.active,
  .datepicker table tr td.active.disabled:hover.disabled,
  .datepicker table tr td.active.disabled:hover:active,
  .datepicker table tr td.active.disabled:hover:hover,
  .datepicker table tr td.active.disabled:hover[disabled],
  .datepicker table tr td.active.disabled[disabled],
  .datepicker table tr td.active:active,
  .datepicker table tr td.active:hover,
  .datepicker table tr td.active:hover.active,
  .datepicker table tr td.active:hover.disabled,
  .datepicker table tr td.active:hover:active,
  .datepicker table tr td.active:hover:hover,
  .datepicker table tr td.active:hover[disabled],
  .datepicker table tr td.active[disabled] {
    background-color: #04c;
  }

  .datepicker table tr td.active.active,
  .datepicker table tr td.active.disabled.active,
  .datepicker table tr td.active.disabled:active,
  .datepicker table tr td.active.disabled:hover.active,
  .datepicker table tr td.active.disabled:hover:active,
  .datepicker table tr td.active:active,
  .datepicker table tr td.active:hover.active,
  .datepicker table tr td.active:hover:active {
    background-color: #039\9;
  }

  .datepicker table tr td span {
    display: block;
    width: 23%;
    height: 54px;
    line-height: 54px;
    float: left;
    margin: 1%;
    cursor: pointer;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
  }

  .datepicker table tr td span.focused,
  .datepicker table tr td span:hover {
    background: #eee;
  }

  .datepicker table tr td span.disabled,
  .datepicker table tr td span.disabled:hover {
    background: 0 0;
    color: #999;
    cursor: default;
  }

  .datepicker table tr td span.active,
  .datepicker table tr td span.active.disabled,
  .datepicker table tr td span.active.disabled:hover,
  .datepicker table tr td span.active:hover {
    background-color: #006dcc;
    background-image: -moz-linear-gradient(to bottom, #08c, #04c);
    background-image: -ms-linear-gradient(to bottom, #08c, #04c);
    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      from(#08c),
      to(#04c)
    );
    background-image: -webkit-linear-gradient(to bottom, #08c, #04c);
    background-image: -o-linear-gradient(to bottom, #08c, #04c);
    background-image: linear-gradient(to bottom, #08c, #04c);
    background-repeat: repeat-x;
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#08c', endColorstr='#0044cc', GradientType=0);
    border-color: #04c #04c #002a80;
    border-color: rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.1) rgba(0, 0, 0, 0.25);
    filter: progid:DXImageTransform.Microsoft.gradient(enabled=false);
    color: #fff;
    text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.25);
  }

  .datepicker table tr td span.active.active,
  .datepicker table tr td span.active.disabled,
  .datepicker table tr td span.active.disabled.active,
  .datepicker table tr td span.active.disabled.disabled,
  .datepicker table tr td span.active.disabled:active,
  .datepicker table tr td span.active.disabled:hover,
  .datepicker table tr td span.active.disabled:hover.active,
  .datepicker table tr td span.active.disabled:hover.disabled,
  .datepicker table tr td span.active.disabled:hover:active,
  .datepicker table tr td span.active.disabled:hover:hover,
  .datepicker table tr td span.active.disabled:hover[disabled],
  .datepicker table tr td span.active.disabled[disabled],
  .datepicker table tr td span.active:active,
  .datepicker table tr td span.active:hover,
  .datepicker table tr td span.active:hover.active,
  .datepicker table tr td span.active:hover.disabled,
  .datepicker table tr td span.active:hover:active,
  .datepicker table tr td span.active:hover:hover,
  .datepicker table tr td span.active:hover[disabled],
  .datepicker table tr td span.active[disabled] {
    background-color: #04c;
  }

  .datepicker table tr td span.active.active,
  .datepicker table tr td span.active.disabled.active,
  .datepicker table tr td span.active.disabled:active,
  .datepicker table tr td span.active.disabled:hover.active,
  .datepicker table tr td span.active.disabled:hover:active,
  .datepicker table tr td span.active:active,
  .datepicker table tr td span.active:hover.active,
  .datepicker table tr td span.active:hover:active {
    background-color: #039\9;
  }

  .datepicker table tr td span.new,
  .datepicker table tr td span.old {
    color: #999;
  }

  .datepicker .datepicker-switch {
    width: 145px;
  }

  .datepicker .datepicker-switch,
  .datepicker .next,
  .datepicker .prev,
  .datepicker tfoot tr th {
    cursor: pointer;
  }

  .datepicker .datepicker-switch:hover,
  .datepicker .next:hover,
  .datepicker .prev:hover,
  .datepicker tfoot tr th:hover {
    background: #eee;
  }

  .datepicker .next.disabled,
  .datepicker .prev.disabled {
    visibility: hidden;
  }

  .datepicker .cw {
    font-size: 10px;
    width: 12px;
    padding: 0 2px 0 5px;
    vertical-align: middle;
  }

  .input-append.date .add-on,
  .input-prepend.date .add-on {
    cursor: pointer;
  }

  .input-append.date .add-on i,
  .input-prepend.date .add-on i {
    margin-top: 3px;
  }

  .input-daterange input {
    text-align: center;
  }

  .input-daterange input:first-child {
    -webkit-border-radius: 3px 0 0 3px;
    -moz-border-radius: 3px 0 0 3px;
    border-radius: 3px 0 0 3px;
  }

  .input-daterange input:last-child {
    -webkit-border-radius: 0 3px 3px 0;
    -moz-border-radius: 0 3px 3px 0;
    border-radius: 0 3px 3px 0;
  }

  .input-daterange .add-on {
    display: inline-block;
    width: auto;
    min-width: 16px;
    height: 18px;
    padding: 4px 5px;
    font-weight: 400;
    line-height: 18px;
    text-align: center;
    text-shadow: 0 1px 0 #fff;
    vertical-align: middle;
    background-color: #eee;
    border: 1px solid #ccc;
    margin-left: -5px;
    margin-right: -5px;
  }

  /** fixes by martijn **/
  .question .date input[type='text'] {
    display: inline-block;
    width: 144px;
  }

  table {
    max-width: 100%;
    background-color: transparent;
  }

  th {
    text-align: left;
  }

  .table-condensed > thead > tr > th,
  .table-condensed > thead > tr > td,
  .table-condensed > tbody > tr > th,
  .table-condensed > tbody > tr > td,
  .table-condensed > tfoot > tr > th,
  .table-condensed > tfoot > tr > td {
    padding: 5px;
  }

  .table-hover > tbody > tr:hover > td,
  .table-hover > tbody > tr:hover > th {
    background-color: whitesmoke;
  }

  table col[class*='col-'] {
    position: static;
    float: none;
    display: table-column;
  }

  table td[class*='col-'],
  table th[class*='col-'] {
    position: static;
    float: none;
    display: table-cell;
  }

  .table > thead > tr > td.active,
  .table > thead > tr > th.active,
  .table > thead > tr.active > td,
  .table > thead > tr.active > th,
  .table > tbody > tr > td.active,
  .table > tbody > tr > th.active,
  .table > tbody > tr.active > td,
  .table > tbody > tr.active > th,
  .table > tfoot > tr > td.active,
  .table > tfoot > tr > th.active,
  .table > tfoot > tr.active > td,
  .table > tfoot > tr.active > th {
    background-color: whitesmoke;
  }

  .table-hover > tbody > tr > td.active:hover,
  .table-hover > tbody > tr > th.active:hover,
  .table-hover > tbody > tr.active:hover > td,
  .table-hover > tbody > tr.active:hover > th {
    background-color: #e8e8e8;
  }

  .timepicker {
    position: relative;
  }
  .timepicker.pull-right .timepicker-widget.dropdown-menu {
    left: auto;
    right: 0;
  }
  .timepicker.pull-right .timepicker-widget.dropdown-menu:before {
    left: auto;
    right: 12px;
  }
  .timepicker.pull-right .timepicker-widget.dropdown-menu:after {
    left: auto;
    right: 13px;
  }
  .timepicker .input-group-addon {
    cursor: pointer;
  }
  .timepicker .input-group-addon i {
    display: inline-block;
    width: 16px;
    height: 16px;
  }

  .timepicker-widget.dropdown-menu {
    padding: 4px;
  }
  .timepicker-widget.dropdown-menu.open {
    display: inline-block;
  }
  .timepicker-widget.dropdown-menu:before {
    border-bottom: 7px solid rgba(0, 0, 0, 0.2);
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    content: '';
    display: inline-block;
    position: absolute;
  }
  .timepicker-widget.dropdown-menu:after {
    border-bottom: 6px solid #ffffff;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    content: '';
    display: inline-block;
    position: absolute;
  }

  .timepicker-widget.timepicker-orient-left:before {
    left: 6px;
  }

  .timepicker-widget.timepicker-orient-left:after {
    left: 7px;
  }

  .timepicker-widget.timepicker-orient-right:before {
    right: 6px;
  }

  .timepicker-widget.timepicker-orient-right:after {
    right: 7px;
  }

  .timepicker-widget.timepicker-orient-top:before {
    top: -7px;
  }

  .timepicker-widget.timepicker-orient-top:after {
    top: -6px;
  }

  .timepicker-widget.timepicker-orient-bottom:before {
    bottom: -7px;
    border-bottom: 0;
    border-top: 7px solid #999;
  }

  .timepicker-widget.timepicker-orient-bottom:after {
    bottom: -6px;
    border-bottom: 0;
    border-top: 6px solid #ffffff;
  }

  .timepicker-widget a.btn,
  .timepicker-widget .vex.vex-theme-plain a.vex-dialog-button,
  .vex.vex-theme-plain .timepicker-widget a.vex-dialog-button,
  .timepicker-widget input {
    border-radius: 4px;
  }

  .timepicker-widget table {
    width: 100%;
    margin: 0;
  }
  .timepicker-widget table td {
    text-align: center;
    height: 30px;
    margin: 0;
    padding: 2px;
  }
  .timepicker-widget table td:not(.separator) {
    min-width: 30px;
  }
  .timepicker-widget table td span {
    width: 100%;
  }
  .timepicker-widget table td a {
    border: 1px transparent solid;
    width: 100%;
    display: inline-block;
    margin: 0;
    padding: 8px 0;
    outline: 0;
    color: #333;
  }
  .timepicker-widget table td a:hover {
    text-decoration: none;
    background-color: #eee;
    -webkit-border-radius: 4px;
    -moz-border-radius: 4px;
    border-radius: 4px;
    border-color: #ddd;
  }
  .timepicker-widget table td a i {
    margin-top: 2px;
    font-size: 18px;
  }
  .timepicker-widget table td input {
    width: 25px;
    margin: 0;
    text-align: center;
  }

  .timepicker input[type='text'] {
    display: inline-block;
    width: 144px;
  }

  .timepicker-widget.dropdown-menu input {
    width: 50px;
    margin: 0 auto;
  }

  .timepicker-widget table td span {
    width: 12px;
  }

  .timepicker-widget table td a i {
    width: 11px;
    height: 17px;
    display: inline-block;
  }

  .datetimepicker .date,
  .datetimepicker .timepicker {
    margin-right: 10px;
    display: inline-block;
  }

  .datetimepicker .date {
    margin-right: 10px;
  }

  .or[dir='rtl'] .datetimepicker .date {
    margin-right: 0;
  }

  .touch .timepicker-widget.dropdown-menu input {
    width: 50px;
    margin: 0 auto;
  }

  .question.or-appearance-compact legend,
  .question.or-appearance-quickcompact legend {
    border: none;
  }

  .question.or-appearance-compact .option-wrapper,
  .question.or-appearance-quickcompact .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact .option-wrapper > label,
  .question.or-appearance-quickcompact .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact .option-wrapper > label:hover,
  .question.or-appearance-quickcompact .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact .option-wrapper > label .option-label,
  .question.or-appearance-quickcompact .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact .option-wrapper > label .active,
  .question.or-appearance-quickcompact .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact .option-wrapper > label input,
  .question.or-appearance-quickcompact .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact
    .option-wrapper
    > label
    input:checked
    ~ .active:hover,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact .option-wrapper > label input:focus ~ .active,
  .question.or-appearance-quickcompact
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-1 legend {
    border: none;
  }

  .question.or-appearance-compact-1 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-1 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-1 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-1 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-1 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-1 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact-1
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-1 .option-wrapper > label {
    width: 100%;
  }
  .question.or-appearance-compact-1 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-2 legend {
    border: none;
  }

  .question.or-appearance-compact-2 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-2 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-2 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-2 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-2 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-2 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact-2
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-2 .option-wrapper > label {
    width: 50%;
  }
  .question.or-appearance-compact-2 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-3 legend {
    border: none;
  }

  .question.or-appearance-compact-3 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-3 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-3 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-3 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-3 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-3 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact-3
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-3 .option-wrapper > label {
    width: 33.3333333333%;
  }
  .question.or-appearance-compact-3 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-4 legend {
    border: none;
  }

  .question.or-appearance-compact-4 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-4 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-4 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-4 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-4 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-4 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact-4
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-4 .option-wrapper > label {
    width: 25%;
  }
  .question.or-appearance-compact-4 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-5 legend {
    border: none;
  }

  .question.or-appearance-compact-5 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-5 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-5 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-5 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-5 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-5 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact-5
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-5 .option-wrapper > label {
    width: 20%;
  }
  .question.or-appearance-compact-5 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-6 legend {
    border: none;
  }

  .question.or-appearance-compact-6 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-6 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-6 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-6 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-6 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-6 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    /*border-color: #ee7325; */
    border-color: #ee7325;
  }
  .question.or-appearance-compact-6
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-6 .option-wrapper > label {
    width: 16.6666666667%;
  }
  .question.or-appearance-compact-6 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-7 legend {
    border: none;
  }

  .question.or-appearance-compact-7 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-7 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-7 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-7 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-7 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-7 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    border-color: #ee7325;
  }
  .question.or-appearance-compact-7
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-7 .option-wrapper > label {
    width: 14.2857142857%;
  }
  .question.or-appearance-compact-7 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-8 legend {
    border: none;
  }

  .question.or-appearance-compact-8 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-8 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-8 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-8 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-8 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-8 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    border-color: #ee7325;
  }
  .question.or-appearance-compact-8
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-8 .option-wrapper > label {
    width: 12.5%;
  }
  .question.or-appearance-compact-8 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-9 legend {
    border: none;
  }

  .question.or-appearance-compact-9 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-9 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-9 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-9 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-9 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-9 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    border-color: #ee7325;
  }
  .question.or-appearance-compact-9
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-9 .option-wrapper > label {
    width: 11.1111111111%;
  }
  .question.or-appearance-compact-9 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .question.or-appearance-compact-10 legend {
    border: none;
  }

  .question.or-appearance-compact-10 .option-wrapper {
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
  }

  .question.or-appearance-compact-10 .option-wrapper > label {
    display: inline-block;
    margin: 0;
    padding: 10px !important;
  }
  .question.or-appearance-compact-10 .option-wrapper > label:hover {
    background: none;
  }
  .question.or-appearance-compact-10 .option-wrapper > label .option-label {
    padding: 2px;
  }
  .question.or-appearance-compact-10 .option-wrapper > label .active {
    display: inline-block;
    margin-left: 0;
    margin-right: 0;
    max-width: 150px;
    max-height: 150px;
    float: none;
    border: 2px solid transparent;
  }
  .question.or-appearance-compact-10 .option-wrapper > label input {
    width: 1px;
    height: 1px;
    position: relative;
    top: 15px;
    left: 15px;
    z-index: -1;
  }
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input:not([disabled]):not([readonly])
    ~ .active:hover {
    border-color: #faa474;
  }
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active,
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input[disabled]:checked
    ~ .active:hover,
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active,
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input[readonly]:checked
    ~ .active:hover {
    border-color: #555555;
  }
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input:checked
    ~ .active,
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input:checked
    ~ .active:hover {
    border-color: #ee7325;
  }
  .question.or-appearance-compact-10
    .option-wrapper
    > label
    input:focus
    ~ .active {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question.or-appearance-compact-10 .option-wrapper > label {
    width: 10%;
  }
  .question.or-appearance-compact-10 .option-wrapper > label img.active {
    max-width: 100%;
    max-height: 100%;
  }

  .file-picker .fake-file-input {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    border: none;
    box-shadow: none;
    background: transparent;
    padding: 5px 0;
    margin: 0;
    width: 100%;
    height: 34px;
    flex-basis: 34px;
    display: inline-block;
    width: 80%;
    text-align: start;
  }
  .file-picker .fake-file-input:focus {
    outline: none;
    box-shadow: none;
  }
  .file-picker .fake-file-input::-moz-placeholder {
    color: #999999;
    opacity: 1;
  }
  .file-picker .fake-file-input:-ms-input-placeholder {
    color: #999999;
  }
  .file-picker .fake-file-input::-webkit-input-placeholder {
    color: #999999;
  }
  .file-picker .fake-file-input[disabled],
  .file-picker .fake-file-input[readonly],
  fieldset[disabled] .file-picker .fake-file-input {
    cursor: not-allowed;
    background-color: #eeeeee;
    opacity: 1;
    padding-left: 5px;
    padding-right: 5px;
  }

  .file-picker .file-feedback,
  .file-picker .file-preview {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
  }

  .file-picker .file-feedback.warning {
    color: #8a6d3b;
  }

  .file-picker .file-preview {
    margin-top: 10px;
  }

  .file-picker .btn-download {
    margin-right: 0;
  }
  .file-picker .btn-download[href=''] {
    display: none;
  }

  .or-drawing-initialized input[type='text'],
  .or-signature-initialized input[type='text'],
  .or-annotate-initialized input[type='text'] {
    display: none;
  }

  .or-signature-initialized .draw-widget__body {
    padding-top: 45%;
  }

  .draw-widget {
    width: 100%;
  }
  .draw-widget__body {
    position: relative;
    width: 100%;
    padding-top: 75%;
  }
  .draw-widget__body__canvas {
    background: white;
    border: 1px solid #eeeeee;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    border: none;
    box-shadow: none;
    background: transparent;
    padding: 5px 0;
    margin: 0;
    width: 100%;
    height: 34px;
    flex-basis: 34px;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 0;
    width: 100%;
    height: 100%;
  }
  .draw-widget__body__canvas:focus {
    outline: none;
    box-shadow: none;
  }
  .draw-widget__body__canvas::-moz-placeholder {
    color: #999999;
    opacity: 1;
  }
  .draw-widget__body__canvas:-ms-input-placeholder {
    color: #999999;
  }
  .draw-widget__body__canvas::-webkit-input-placeholder {
    color: #999999;
  }
  .draw-widget__body__canvas[disabled],
  .draw-widget__body__canvas[readonly],
  fieldset[disabled] .draw-widget__body__canvas {
    cursor: not-allowed;
    background-color: #eeeeee;
    opacity: 1;
    padding-left: 5px;
    padding-right: 5px;
  }
  .draw-widget__body__canvas.disabled {
    cursor: not-allowed;
    background: white;
    opacity: 1;
  }
  .draw-widget__body__canvas.disabled ~ .draw-widget__colorpicker,
  .draw-widget__body__canvas.disabled ~ .draw-widget__undo {
    display: none;
  }
  .draw-widget__body input[type='file'] {
    display: none;
  }
  .draw-widget__body .file-picker {
    position: absolute;
    top: -50px;
    left: 0;
    width: 100%;
  }
  .draw-widget__body .show-canvas-btn {
    position: absolute;
    z-index: 10;
    top: calc(50% - 16px);
    left: 50%;
    width: 200px;
    margin-left: -100px;
  }
  .draw-widget__body .hide-canvas-btn {
    display: none;
  }
  .draw-widget__footer {
    margin-top: 10px;
  }
  .draw-widget__footer .draw-widget__btn-reset:disabled {
    display: none;
  }
  .draw-widget__undo {
    position: absolute;
    top: 37px;
    right: 7px;
    width: 20px;
    height: 20px;
    margin: 2px;
    padding: 0;
    border: 2px solid grey;
  }
  .draw-widget__colorpicker {
    position: absolute;
    display: flex;
    flex-wrap: wrap;
    max-width: calc(100% - (2 * 7px));
    top: 7px;
    right: 7px;
  }
  .draw-widget__colorpicker div {
    display: none;
  }
  .draw-widget__colorpicker div {
    width: 20px;
    height: 20px;
    margin: 2px;
    border: none;
    padding: 0;
  }
  .draw-widget__colorpicker.reveal div {
    display: block;
  }
  .draw-widget__colorpicker .current {
    display: block;
    border: 2px solid grey;
  }
  .draw-widget.full-screen {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 20;
    background: white;
    margin: 0;
    padding-left: 15px;
    padding-right: 15px;
  }
  .draw-widget.full-screen .draw-widget__body {
    width: calc(100vmin - 2 * 15px);
    padding-top: calc(0.75 * 100vmin);
    margin: 50px auto;
  }
  .draw-widget.full-screen .draw-widget__body input[type='file'] {
    left: 90px;
  }
  .draw-widget.full-screen .draw-widget__body .file-picker {
    left: 80px;
    width: calc(100% - 18px);
  }
  .draw-widget.full-screen .hide-canvas-btn {
    display: block;
    position: absolute;
    z-index: 30;
    top: -40px;
    left: 0;
    width: 70px;
  }
  .draw-widget.full-screen .show-canvas-btn {
    display: none;
  }
  .draw-widget.full-screen .draw-widget__footer {
    width: calc(100vmin - 2 * 15px);
    margin: -40px auto 0 auto;
  }
  .draw-widget .btn-download {
    margin-right: 0;
  }
  .draw-widget .btn-download[href=''] {
    display: none;
  }

  .or-signature-initialized .draw-widget.full-screen .draw-widget__body {
    width: calc(100% - 2 * 15px);
    padding-top: calc(0.45 * (100% - 2 * 15px));
  }

  .or-signature-initialized .draw-widget.full-screen .draw-widget__footer {
    width: calc(100% - 2 * 15px);
  }

  .or-annotate-initialized .draw-widget__body {
    margin-top: 50px;
  }

  .or-appearance-likert .option-wrapper {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
  }
  .or-appearance-likert .option-wrapper > label {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    margin: 0;
    float: none;
    padding-left: 0 !important;
    padding-right: 0;
  }
  .or-appearance-likert .option-wrapper > label input[type='radio'],
  .or-appearance-likert .option-wrapper > label input[type='checkbox'] {
    position: relative;
    left: 50%;
    padding: 0;
    margin-left: -10px;
    background-color: white;
    z-index: 10;
  }
  .or-appearance-likert .option-wrapper > label .active {
    margin: 0;
  }
  .or-appearance-likert .option-wrapper > label .option-label {
    position: relative;
    text-align: center;
    margin-top: -8.5px;
    padding-top: 15px;
    border-top: 3px solid #666666;
    font-size: 12px;
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
  }
  .or-appearance-likert
    .option-wrapper
    > label:first-of-type
    .option-label::after {
    content: '';
    display: block;
    position: absolute;
    top: -3px;
    width: 50%;
    background-color: white;
    height: 10px;
    left: 0;
  }
  .or-appearance-likert
    .option-wrapper
    > label:last-of-type
    .option-label::after {
    content: '';
    display: block;
    position: absolute;
    top: -3px;
    width: 50%;
    background-color: white;
    height: 10px;
    right: 0;
  }
  .or-appearance-likert .option-wrapper > label:hover {
    background-color: transparent;
  }

  .or-appearance-likert:hover
    .option-wrapper
    > label:first-of-type
    .option-label::after,
  .or-appearance-likert:hover
    .option-wrapper
    > label:last-of-type
    .option-label::after {
    background-color: #fffded;
  }

  .or-appearance-likert.focus
    .option-wrapper
    > label:first-of-type
    .option-label::after,
  .or-appearance-likert.focus
    .option-wrapper
    > label:last-of-type
    .option-label::after {
    background-color: #fffad4;
  }

  .or[dir='rtl'] .or-appearance-likert .option-wrapper > label {
    margin-right: 0;
  }
  .or[dir='rtl']
    .or-appearance-likert
    .option-wrapper
    > label:first-of-type
    .option-label::after {
    left: auto;
    right: 0;
  }
  .or[dir='rtl']
    .or-appearance-likert
    .option-wrapper
    > label:last-of-type
    .option-label::after {
    right: auto;
    left: 0;
  }
  .or[dir='rtl']
    .or-appearance-likert
    .option-wrapper
    > label
    input[type='radio'],
  .or[dir='rtl']
    .or-appearance-likert
    .option-wrapper
    > label
    input[type='checkbox'] {
    right: 50%;
    margin-right: -10px;
  }

  .or[dir='rtl'] .or-appearance-likert .option-wrapper .option-label {
    margin-right: 0;
  }

  .or-repeat
    .or-appearance-likert
    .option-wrapper
    > label:first-of-type
    .option-label::after,
  .or-repeat
    .or-appearance-likert
    .option-wrapper
    > label:last-of-type
    .option-label::after,
  .or-repeat .or-appearance-likert .option-wrapper > label input[type='radio'],
  .or-repeat
    .or-appearance-likert
    .option-wrapper
    > label
    input[type='checkbox'] {
    background-color: #fef5ef;
  }

  .or-horizontal-initialized .option-wrapper {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
  }

  .or-horizontal-initialized label,
  .or-horizontal-initialized .filler {
    -webkit-flex: 1 0 30%;
    -ms-flex: 1 0 30%;
    flex: 1 0 30%;
  }

  .or-horizontal-initialized .filler,
  .or-horizontal-initialized .filler:hover,
  .or-horizontal-initialized .filler:focus {
    border: none !important;
    background: transparent !important;
  }

  .or-appearance-horizontal-compact .option-wrapper {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
  }

  .or-appearance-horizontal-compact label {
    display: inline-block;
  }

  .touch
    .question:not(.or-appearance-compact):not(.or-appearance-quickcompact):not(.or-appearance-label):not(.or-appearance-list-nolabel):not(.or-appearance-likert).or-horizontal-initialized
    .option-wrapper
    > label,
  .touch
    .question:not(.or-appearance-compact):not(.or-appearance-quickcompact):not(.or-appearance-label):not(.or-appearance-list-nolabel):not(.or-appearance-likert).or-appearance-horizontal-compact
    .option-wrapper
    > label {
    margin-right: 10px;
  }

  .touch
    .or[dir='rtl']
    .question:not(.or-appearance-compact):not(.or-appearance-quickcompact):not(.or-appearance-label):not(.or-appearance-list-nolabel):not(.or-appearance-likert).or-horizontal-initialized
    .option-wrapper
    > label,
  .touch
    .or[dir='rtl']
    .question:not(.or-appearance-compact):not(.or-appearance-quickcompact):not(.or-appearance-label):not(.or-appearance-list-nolabel):not(.or-appearance-likert).or-appearance-horizontal-compact
    .option-wrapper
    > label {
    margin-left: 10px;
    margin-right: inherit;
  }

  .or-big-image {
    display: block;
    max-width: 70%;
    max-height: 300px;
  }
  .or-big-image img {
    border: 2px solid #ee7325;
    max-width: 100%;
  }
  .or-big-image.open {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    z-index: 10000;
    background: white;
    margin-top: 0;
  }
  .or-big-image.open img {
    max-width: 100%;
    width: 100%;
    max-height: 100%;
  }

  .or-comment-widget {
    display: block;
    position: absolute;
    z-index: 1001;
    top: 100%;
    left: 0;
    width: 100%;
  }
  .or-comment-widget__overlay {
    background: rgba(0, 0, 0, 0.3);
  }
  .or-comment-widget__content {
    position: relative;
    border: 1px solid #555555;
    background: white;
    padding: 30px;
    padding-bottom: 100px;
  }
  .or-comment-widget__content__btn-update {
    position: absolute;
    right: 30px;
    bottom: 30px;
  }
  .or-comment-widget__content__btn-close-x {
    top: 20px;
    right: 13px;
    position: absolute;
    content: '\00D7';
    font-size: 26px;
    font-weight: normal;
    line-height: 31px;
    height: 30px;
    width: 30px;
    text-align: center;
    color: #bbb;
    background: transparent;
  }
  .or-comment-widget__overlay {
    position: fixed;
    background: rgba(0, 0, 0, 0.4);
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
  .or-comment-widget__question-label,
  .or-comment-widget__question-value {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    font-style: italic;
    padding-right: 35px;
  }
  .or-comment-widget__question-value {
    margin-left: 20px;
    margin-top: 10px;
  }
  .or-comment-widget .question textarea,
  .or-comment-widget .question input[type='text'] {
    width: 100%;
  }
  .or-comment-widget .or-required-msg.active,
  .or-comment-widget .file-picker .file-feedback.warning,
  .file-picker .or-comment-widget .file-feedback.warning,
  .or-comment-widget .or-constraint-msg.active,
  .or-comment-widget .file-picker .file-feedback.error,
  .file-picker .or-comment-widget .file-feedback.error,
  .or-comment-widget .draw-widget__feedback,
  .or-comment-widget .image-map__error {
    display: none;
  }
  .or-comment-widget .invalid-required > .or-required-msg,
  .or-comment-widget .invalid-constraint > .or-constraint-msg {
    display: block;
  }

  .btn-comment {
    cursor: pointer;
  }
  .btn-comment.invalid {
    -webkit-transition: all 0.6s ease-out;
    transition: all 0.6s ease-out;
    color: #e00e0e;
  }
  .btn-comment.invalid .icon,
  .btn-comment.invalid .android-chrome,
  .btn-comment.invalid .record-list__records__record[data-draft='true']::before,
  .btn-comment.invalid .enketo-geopoint-marker,
  .btn-comment.invalid .glyphicon-chevron-up,
  .btn-comment.invalid .glyphicon-chevron-down {
    font-weight: bold;
  }

  .or[dir='rtl'] .btn-comment {
    left: auto;
    right: calc(100% - 25px);
  }

  .or[dir='rtl'] .or-comment-widget__content__btn-update {
    right: auto;
    left: 30px;
  }

  .or[dir='rtl'] .or-comment-widget__content__btn-close-x {
    right: auto;
    left: 13px;
  }

  .or[dir='rtl'] .or-comment-widget__question-label,
  .or[dir='rtl'] .or-comment-widget__question-value {
    padding-right: 0;
    padding-left: 35px;
  }

  .or[dir='rtl'] .or-comment-widget__question-value {
    margin-left: 0;
    margin-right: 20px;
  }

  .or-image-map-initialized img {
    visibility: hidden;
  }

  .or-image-map-initialized .option-wrapper {
    display: none;
  }

  .or-image-map-initialized .image-map svg:not([or-readonly]) path[id]:hover,
  .or-image-map-initialized .image-map svg:not([or-readonly]) g[id]:hover {
    opacity: 0.5 !important;
  }

  .image-map svg {
    display: block;
    margin: 0 auto;
    max-width: 100%;
    width: 100 vmin;
    height: auto;
  }
  .image-map svg[or-readonly] {
    opacity: 0.75 !important;
  }
  .image-map svg path[id][or-selected],
  .image-map svg g[id][or-selected] {
    fill: #ee7325 !important;
    stroke: #ee7325 !important;
  }

  .image-map__ui {
    height: 2em;
    width: 100%;
    text-align: center;
    font-weight: normal;
  }
  .image-map__ui__tooltip {
    display: inline-block;
    background: #fee5d6;
    padding: 2px 8px;
    color: #555555;
    border-radius: 2px;
  }
  .image-map__ui__tooltip:empty {
    padding: 0;
  }

  .or-appearance-literacy.simple-select input[type='text'] {
    display: none;
  }

  .or-appearance-literacy.simple-select .option-wrapper {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .or-appearance-literacy.simple-select .option-wrapper label {
    display: none;
    flex-direction: column;
    padding: 10px;
    margin: 2px 4px;
  }
  .or-appearance-literacy.simple-select
    .option-wrapper
    label.incorrect-word
    .option-label {
    text-decoration: line-through;
  }
  .or-appearance-literacy.simple-select .option-wrapper label.at-flash {
    background-color: #66afe9 !important;
  }
  .or-appearance-literacy.simple-select .option-wrapper label.at-end {
    background-color: #f2dede !important;
  }
  .or-appearance-literacy.simple-select .option-wrapper label.unread {
    opacity: 0.5;
  }
  .or-appearance-literacy.simple-select .option-wrapper .option-label {
    order: 1;
    margin: 0 auto;
    font-size: 1.5em;
  }
  .or-appearance-literacy.simple-select .option-wrapper input[type='checkbox'] {
    order: 2;
    margin: 10px auto 0 auto;
  }
  .or-appearance-literacy.simple-select
    .option-wrapper
    input[type='checkbox']:disabled,
  .or-appearance-literacy.simple-select
    .option-wrapper
    input[type='checkbox'][readonly] {
    visibility: hidden;
  }

  .or-appearance-literacy.simple-select .literacy-widget__start,
  .or-appearance-literacy.simple-select .literacy-widget__stop,
  .or-appearance-literacy.simple-select .literacy-widget__timer {
    display: block;
    margin: 0 calc(100% / 2 - 100px);
    width: 200px;
    margin-bottom: 20px;
  }

  .or-appearance-literacy.simple-select .literacy-widget__stop {
    display: none;
  }

  .or-appearance-literacy.simple-select .literacy-widget__timer {
    display: none;
    margin-bottom: 10px;
    font-size: 1.8em;
    padding: 10px;
    border: 1px solid #555555;
    text-align: center;
    background: white;
  }

  .or-appearance-literacy.simple-select .literacy-widget .btn-reset {
    margin-left: calc(100% - 30px);
  }

  .or-appearance-literacy.simple-select.flash .literacy-widget label,
  .or-appearance-literacy.simple-select.stop .literacy-widget label,
  .or-appearance-literacy.simple-select.start .literacy-widget label,
  .or-appearance-literacy.simple-select.finish .literacy-widget label {
    display: flex;
  }

  .or-appearance-literacy.simple-select.flash .literacy-widget__timer,
  .or-appearance-literacy.simple-select.stop .literacy-widget__timer,
  .or-appearance-literacy.simple-select.start .literacy-widget__timer,
  .or-appearance-literacy.simple-select.finish .literacy-widget__timer {
    display: block;
  }

  .or-appearance-literacy.simple-select.flash .literacy-widget__start,
  .or-appearance-literacy.simple-select.stop .literacy-widget__start,
  .or-appearance-literacy.simple-select.start .literacy-widget__start,
  .or-appearance-literacy.simple-select.finish .literacy-widget__start {
    display: none;
  }

  .or-appearance-literacy.simple-select.flash .literacy-widget__stop,
  .or-appearance-literacy.simple-select.start .literacy-widget__stop {
    display: block;
  }

  .or-appearance-literacy.simple-select.flash:not(.note):not(.focus),
  .or-appearance-literacy.simple-select.flash.question:not(.note):not(.focus):hover,
  .or-appearance-literacy.simple-select.stop:not(.note):not(.focus),
  .or-appearance-literacy.simple-select.stop.question:not(.note):not(.focus):hover {
    background: #f9f96e;
  }

  .touch
    .question.or-appearance-literacy.simple-select
    .option-wrapper
    > label {
    padding: 10px;
    margin: 2px 4px;
    border: none;
  }
  .touch
    .question.or-appearance-literacy.simple-select
    .option-wrapper
    > label
    input[type='checkbox'] {
    margin-left: auto;
  }

  .touch
    .question.or-appearance-literacy.simple-select
    .option-wrapper
    .option-label {
    margin-left: 0;
  }

  .caret {
    display: inline-block;
    width: 0;
    height: 0;
    margin-left: 2px;
    vertical-align: middle;
    border-top: 4px solid;
    border-right: 4px solid transparent;
    border-left: 4px solid transparent;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    float: left;
    min-width: 160px;
    padding: 5px 0;
    margin: 2px 0 0;
    list-style: none;
    font-size: 16px;
    background-color: white;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 4px;
    -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.175);
    background-clip: padding-box;
  }
  .dropdown-menu.pull-right {
    right: 0;
    left: auto;
  }
  .dropdown-menu .divider {
    height: 1px;
    margin: 9px 0;
    overflow: hidden;
    background-color: #e5e5e5;
  }
  .dropdown-menu > li > a {
    display: block;
    padding: 3px 20px;
    clear: both;
    font-weight: normal;
    line-height: 1.25;
    color: #333333;
    white-space: nowrap;
  }

  .or[dir='rtl'] .dropdown-menu {
    right: 0;
  }

  .dropdown-menu > li > a:hover,
  .dropdown-menu > li > a:focus {
    text-decoration: none;
    color: #262626;
    background-color: whitesmoke;
  }

  .dropdown-menu > .active > a,
  .dropdown-menu > .active > a:hover,
  .dropdown-menu > .active > a:focus {
    color: white;
    text-decoration: none;
    outline: 0;
    background-color: #ee7325;
  }

  .dropdown-menu > .disabled > a,
  .dropdown-menu > .disabled > a:hover,
  .dropdown-menu > .disabled > a:focus {
    color: #999999;
  }

  .dropdown-menu > .disabled > a:hover,
  .dropdown-menu > .disabled > a:focus {
    text-decoration: none;
    background-color: transparent;
    background-image: none;
    filter: progid:DXImageTransform.Microsoft.gradient(enabled = false);
    cursor: not-allowed;
  }

  .open > .dropdown-menu {
    display: block;
  }

  .open > a {
    outline: 0;
  }

  .question .geopoint.widget input[type='number'][name='alt'],
  .question .geopoint.widget input[type='number'][name='acc'],
  .question .geopoint.widget input[type='text'][name='alt'],
  .question .geopoint.widget input[type='text'][name='acc'] {
    width: 40%;
  }

  .widget.date,
  .widget.timepicker,
  .widget.datetimepicker {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
  }

  .question .widget.datetimepicker .date,
  .question .widget.datetimepicker .timepicker {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
  }

  .question .widget.datetimepicker .timepicker {
    margin-left: 0;
    margin-right: 0;
  }

  .or-appearance-likert .option-wrapper {
    margin-top: 20px;
  }
  .or-appearance-likert .option-wrapper > label {
    -webkit-flex-direction: column-reverse;
    -ms-flex-direction: column-reverse;
    -moz-flex-direction: column-reverse;
    flex-direction: column-reverse;
    justify-content: flex-end;
  }

  .question.or-appearance-list-nolabel,
  .question.or-appearance-label {
    margin: 0;
  }
  .question.or-appearance-list-nolabel:not(:last-of-type),
  .question.or-appearance-label:not(:last-of-type) {
    border-bottom: none;
  }

  .or-appearance-label {
    padding-bottom: 0;
  }

  .touch
    .question:not(.or-appearance-compact):not(.or-appearance-quickcompact):not(.or-appearance-label):not(.or-appearance-list-nolabel):not(.or-appearance-likert)
    .option-wrapper
    > label {
    border: none;
    border-radius: 0;
  }

  .question .geopicker.widget input[type='text'],
  .question .geopicker.widget input[type='number'],
  .question .geopicker.widget textarea {
    border-radius: 0;
    box-shadow: none;
    border: none;
    border-bottom: 1px dotted #cccccc;
    background-color: transparent;
  }

  .question .geopicker.widget input[type='text'][name='search'] {
    width: 80%;
  }

  .question .geopicker.widget textarea {
    padding-top: 10px;
  }

  .question .geopicker.widget label.geo.alt {
    border-top: none;
  }

  .question .geopicker.widget .btn:not(.close-chain-btn),
  .question
    .geopicker.widget
    .vex.vex-theme-plain
    .vex-dialog-button:not(.close-chain-btn),
  .vex.vex-theme-plain
    .question
    .geopicker.widget
    .vex-dialog-button:not(.close-chain-btn) {
    background: transparent;
    border: none;
  }
  .question .geopicker.widget .btn:not(.close-chain-btn):hover,
  .question
    .geopicker.widget
    .vex.vex-theme-plain
    .vex-dialog-button:not(.close-chain-btn):hover,
  .vex.vex-theme-plain
    .question
    .geopicker.widget
    .vex-dialog-button:not(.close-chain-btn):hover {
    opacity: 0.6;
  }

  .question .geopicker.widget .map-canvas-wrapper,
  .question .geopicker.widget .search-bar {
    border-left: none;
  }

  .question .geopicker.widget:not(.full-screen).hide-input.wide .map-canvas {
    height: 450px;
  }

  .question .geopicker.widget .toggle-input-btn:not(.open) {
    left: 0;
  }

  .esri-geopicker {
    border-bottom: none;
    padding-bottom: 0;
  }
  .esri-geopicker .btn[name='geodetect'],
  .esri-geopicker .vex.vex-theme-plain .vex-dialog-button[name='geodetect'],
  .vex.vex-theme-plain .esri-geopicker .vex-dialog-button[name='geodetect'] {
    border: none;
    background: transparent;
    box-shadow: none;
    font-weight: bolder;
  }
  .esri-geopicker input[type='text'],
  .esri-geopicker input[type='number'],
  .esri-geopicker textarea,
  .esri-geopicker select {
    border-bottom: 1px dotted #cccccc;
  }
  .esri-geopicker .geo-unit {
    right: 12px;
  }

  html:not(.touch) .question .geopoint.widget .search-bar button.btn,
  html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    .vex.vex-theme-plain
    button.vex-dialog-button,
  .vex.vex-theme-plain
    html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    button.vex-dialog-button {
    border: none;
    background: transparent;
    border-radius: 0;
  }
  html:not(.touch) .question .geopoint.widget .search-bar button.btn:hover,
  html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    .vex.vex-theme-plain
    button.vex-dialog-button:hover,
  .vex.vex-theme-plain
    html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    button.vex-dialog-button:hover {
    background: transparent;
    color: #aaaaaa;
  }

  html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    [name='search']
    ~ .input-group-btn
    .btn,
  html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    [name='search']
    ~ .input-group-btn
    .vex.vex-theme-plain
    .vex-dialog-button,
  .vex.vex-theme-plain
    html:not(.touch)
    .question
    .geopoint.widget
    .search-bar
    [name='search']
    ~ .input-group-btn
    .vex-dialog-button {
    border-bottom: 1px dotted #cccccc;
  }

  .or-comment-widget__content {
    padding-top: 60px;
  }

  .or-comment-widget__overlay + .question {
    margin-left: 0;
    margin-right: 0;
  }

  .or-comment-widget .question {
    border: 1px solid black;
  }
  .or-comment-widget .question input,
  .or-comment-widget .question textarea {
    order: 4;
  }

  .btn-comment {
    position: absolute;
    top: 6px;
    right: 0;
    margin: 0;
  }

  legend .btn-comment {
    top: 0;
    right: -6px;
  }
  legend .btn-comment .icon,
  legend .btn-comment .android-chrome,
  legend .btn-comment .record-list__records__record[data-draft='true']::before,
  legend .btn-comment .enketo-geopoint-marker,
  legend .btn-comment .glyphicon-chevron-up,
  legend .btn-comment .glyphicon-chevron-down {
    position: static;
  }

  .or[dir='rtl'] .btn-comment {
    left: 0;
    right: auto;
  }

  .or[dir='rtl'] legend .btn-comment {
    left: -6px;
  }

  .or[dir='rtl'] .esri-geopicker .geo-unit {
    right: auto;
    left: 12px;
  }

  .bootstrap-select .dropdown-toggle,
  .bootstrap-select .dropdown-menu {
    width: 100%;
  }

  .draw-widget__body__canvas {
    border: 1px solid #999999;
  }

  .file-picker {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .file-picker .file-feedback,
  .file-picker .file-preview {
    width: 100%;
  }
  .file-picker .btn-download {
    margin-right: 10px;
  }
  .file-picker .btn-download .icon,
  .file-picker .btn-download .android-chrome,
  .file-picker
    .btn-download
    .record-list__records__record[data-draft='true']::before,
  .file-picker .btn-download .enketo-geopoint-marker,
  .file-picker .btn-download .glyphicon-chevron-up,
  .file-picker .btn-download .glyphicon-chevron-down {
    vertical-align: middle;
    margin-top: 1px;
  }

  .or-appearance-vertical .range-widget__wrap,
  .or-appearance-distress .range-widget__wrap {
    margin-top: 0;
  }

  input[type='text'],
  input[type='tel'],
  input[type='password'],
  input[type='url'],
  input[type='email'],
  input[type='file'],
  input[type='date'],
  input[type='month'],
  input[type='time'],
  input[type='datetime'],
  input[type='number'],
  select,
  textarea {
    -webkit-flex: 1;
    -ms-flex: 1;
    flex: 1;
    border: none;
    box-shadow: none;
    background: transparent;
    padding: 5px 0;
    margin: 0;
    width: 100%;
    height: 34px;
    flex-basis: 34px;
  }
  input[type='text']:focus,
  input[type='tel']:focus,
  input[type='password']:focus,
  input[type='url']:focus,
  input[type='email']:focus,
  input[type='file']:focus,
  input[type='date']:focus,
  input[type='month']:focus,
  input[type='time']:focus,
  input[type='datetime']:focus,
  input[type='number']:focus,
  select:focus,
  textarea:focus {
    outline: none;
    box-shadow: none;
  }
  input[type='text']::-moz-placeholder,
  input[type='tel']::-moz-placeholder,
  input[type='password']::-moz-placeholder,
  input[type='url']::-moz-placeholder,
  input[type='email']::-moz-placeholder,
  input[type='file']::-moz-placeholder,
  input[type='date']::-moz-placeholder,
  input[type='month']::-moz-placeholder,
  input[type='time']::-moz-placeholder,
  input[type='datetime']::-moz-placeholder,
  input[type='number']::-moz-placeholder,
  select::-moz-placeholder,
  textarea::-moz-placeholder {
    color: #999999;
    opacity: 1;
  }
  input[type='text']:-ms-input-placeholder,
  input[type='tel']:-ms-input-placeholder,
  input[type='password']:-ms-input-placeholder,
  input[type='url']:-ms-input-placeholder,
  input[type='email']:-ms-input-placeholder,
  input[type='file']:-ms-input-placeholder,
  input[type='date']:-ms-input-placeholder,
  input[type='month']:-ms-input-placeholder,
  input[type='time']:-ms-input-placeholder,
  input[type='datetime']:-ms-input-placeholder,
  input[type='number']:-ms-input-placeholder,
  select:-ms-input-placeholder,
  textarea:-ms-input-placeholder {
    color: #999999;
  }
  input[type='text']::-webkit-input-placeholder,
  input[type='tel']::-webkit-input-placeholder,
  input[type='password']::-webkit-input-placeholder,
  input[type='url']::-webkit-input-placeholder,
  input[type='email']::-webkit-input-placeholder,
  input[type='file']::-webkit-input-placeholder,
  input[type='date']::-webkit-input-placeholder,
  input[type='month']::-webkit-input-placeholder,
  input[type='time']::-webkit-input-placeholder,
  input[type='datetime']::-webkit-input-placeholder,
  input[type='number']::-webkit-input-placeholder,
  select::-webkit-input-placeholder,
  textarea::-webkit-input-placeholder {
    color: #999999;
  }
  input[type='text'][disabled],
  input[type='text'][readonly],
  fieldset[disabled] input[type='text'],
  input[type='tel'][disabled],
  input[type='tel'][readonly],
  fieldset[disabled] input[type='tel'],
  input[type='password'][disabled],
  input[type='password'][readonly],
  fieldset[disabled] input[type='password'],
  input[type='url'][disabled],
  input[type='url'][readonly],
  fieldset[disabled] input[type='url'],
  input[type='email'][disabled],
  input[type='email'][readonly],
  fieldset[disabled] input[type='email'],
  input[type='file'][disabled],
  input[type='file'][readonly],
  fieldset[disabled] input[type='file'],
  input[type='date'][disabled],
  input[type='date'][readonly],
  fieldset[disabled] input[type='date'],
  input[type='month'][disabled],
  input[type='month'][readonly],
  fieldset[disabled] input[type='month'],
  input[type='time'][disabled],
  input[type='time'][readonly],
  fieldset[disabled] input[type='time'],
  input[type='datetime'][disabled],
  input[type='datetime'][readonly],
  fieldset[disabled] input[type='datetime'],
  input[type='number'][disabled],
  input[type='number'][readonly],
  fieldset[disabled] input[type='number'],
  select[disabled],
  select[readonly],
  fieldset[disabled] select,
  textarea[disabled],
  textarea[readonly],
  fieldset[disabled] textarea {
    cursor: not-allowed;
    background-color: #eeeeee;
    opacity: 1;
    padding-left: 5px;
    padding-right: 5px;
  }

  input:not([readonly]) + .widget input[type='text'][readonly],
  input:not([readonly]) + .widget input[type='tel'][readonly],
  input:not([readonly]) + .widget input[type='password'][readonly],
  input:not([readonly]) + .widget input[type='url'][readonly],
  input:not([readonly]) + .widget input[type='email'][readonly],
  input:not([readonly]) + .widget input[type='file'][readonly],
  input:not([readonly]) + .widget input[type='date'][readonly],
  input:not([readonly]) + .widget input[type='month'][readonly],
  input:not([readonly]) + .widget input[type='time'][readonly],
  input:not([readonly]) + .widget input[type='datetime'][readonly],
  input:not([readonly]) + .widget input[type='number'][readonly],
  input:not([readonly]) + .widget select[readonly],
  input:not([readonly]) + .widget textarea[readonly] {
    background-color: transparent;
    cursor: auto;
  }
  input:not([readonly]) + .widget input[type='text'][readonly]:hover,
  input:not([readonly]) + .widget input[type='tel'][readonly]:hover,
  input:not([readonly]) + .widget input[type='password'][readonly]:hover,
  input:not([readonly]) + .widget input[type='url'][readonly]:hover,
  input:not([readonly]) + .widget input[type='email'][readonly]:hover,
  input:not([readonly]) + .widget input[type='file'][readonly]:hover,
  input:not([readonly]) + .widget input[type='date'][readonly]:hover,
  input:not([readonly]) + .widget input[type='month'][readonly]:hover,
  input:not([readonly]) + .widget input[type='time'][readonly]:hover,
  input:not([readonly]) + .widget input[type='datetime'][readonly]:hover,
  input:not([readonly]) + .widget input[type='number'][readonly]:hover,
  input:not([readonly]) + .widget select[readonly]:hover,
  input:not([readonly]) + .widget textarea[readonly]:hover {
    background-color: transparent;
  }

  fieldset {
    padding: 0;
    margin: 0;
    border: 0;
    min-width: 0;
  }

  /*legend {
      display: block;
      width: 100%;
      padding: 0;
      margin-bottom: $line-height-computed;
      font-size: $font-size-base * 1.5;
      line-height: inherit;
      color: $legend-color;
      border: 0;
      border-bottom: 1px solid $legend-border-color;
  }*/
  input[type='search'] {
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  input[type='radio'],
  input[type='checkbox'] {
    margin: 4px 0 0;
    margin-top: 1px \9;
    /* IE8-9 */
    line-height: normal;
  }

  input[type='file'] {
    display: block;
  }

  input[type='range'] {
    display: block;
    width: 100%;
  }

  select[multiple],
  select[size] {
    height: auto;
  }

  input[type='file']:focus,
  input[type='radio']:focus,
  input[type='checkbox']:focus {
    outline: thin dotted;
    outline: 5px auto -webkit-focus-ring-color;
    outline-offset: -2px;
  }

  input[type='search'] {
    -webkit-appearance: none;
  }

  input[type='date'] {
    line-height: 34px;
  }

  input[type='radio'][disabled],
  fieldset[disabled] input[type='radio'],
  input[type='checkbox'][disabled],
  fieldset[disabled] input[type='checkbox'] {
    cursor: not-allowed;
  }

  .option-wrapper {
    line-height: 20px;
  }

  .question input[type='radio'] {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    -ms-appearance: none;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    margin-bottom: 0;
    margin-top: 0;
    border-width: 3px;
    border-style: solid;
    border-radius: 0;
    background-color: transparent;
    border-color: #666666;
    border-radius: 10px;
  }
  .question input[type='radio']:disabled,
  .question input[type='radio'][readonly] {
    border-color: #737373;
  }
  .question input[type='radio']:focus {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }
  .question input[type='radio']:checked {
    border-color: black;
    background-image: radial-gradient(
      4px,
      black 0%,
      black 99%,
      transparent 100%
    );
  }
  .question input[type='radio']:checked:focus {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .question input[type='checkbox'] {
    appearance: none;
    -moz-appearance: none;
    -webkit-appearance: none;
    -ms-appearance: none;
    display: inline-block;
    width: 20px;
    height: 20px;
    margin-right: 10px;
    margin-bottom: 0;
    margin-top: 0;
    border-width: 3px;
    border-style: solid;
    border-radius: 0;
    background-color: transparent;
    border-color: #666666;
  }
  .question input[type='checkbox']:disabled,
  .question input[type='checkbox'][readonly] {
    border-color: #737373;
  }
  .question input[type='checkbox']:focus {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }
  .question input[type='checkbox']:checked {
    border-color: black;
    background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20stroke%3D%27black%27%20fill%3D%27black%27%20width%3D%2732%27%20height%3D%2732%27%20viewBox%3D%270%200%2032%2032%27%3E%3Cpath%20d%3D%27M25.1%2012.5l-3.4-3.3-8%208-2.9-3-3.4%203.4%206.3%206.3z%27%2F%3E%3C%2Fsvg%3E');
    background-size: 20px 20px;
    background-position: -3px;
  }
  .question input[type='checkbox']:checked:focus {
    outline: 0;
    -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
  }

  .touch .question.simple-select .option-wrapper .option-label {
    margin-left: 35px;
  }

  .or[dir='rtl'] .question input[type='checkbox'],
  .or[dir='rtl'] .question input[type='radio'],
  [dir='rtl'] .form-footer .question input[type='checkbox'],
  [dir='rtl'] .form-footer .question input[type='radio'] {
    margin-right: 0;
    margin-left: 10px;
  }

  .or-appearance-likert .option-wrapper > label .option-label {
    margin-top: -11.5px;
  }

  /** core/layout **/
  body,
  .main,
  .paper,
  .or,
  .or-group,
  .or-group-data,
  .or-repeat,
  .question {
    position: relative;
  }

  body {
    line-height: 1.5;
  }

  .paper {
    border-width: 1px;
    box-shadow: 0 0 5px #888;
  }

  .question input[type='radio'],
  .question input[type='checkbox'] {
    border-width: 1px;
  }

  .question input[type='checkbox']:checked {
    border-color: black;
    background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20stroke%3D%27transparent%27%20fill%3D%27black%27%20width%3D%2732%27%20height%3D%2732%27%20viewBox%3D%270%200%2032%2032%27%3E%3Cpath%20d%3D%27M25.1%2012.5l-3.4-3.3-8%208-2.9-3-3.4%203.4%206.3%206.3z%27%2F%3E%3C%2Fsvg%3E');
    background-size: 20px 20px;
    background-position: -3px;
    background-position: -1px;
  }

  /** core/main **/
  .or-group {
    margin: 0;
    border-top: none;
  }
  .or-group .or-group {
    margin: 0;
  }

  h4 + .or-repeat {
    border-top: none;
  }

  .or-group > h4 {
    background: #ffffff;
    margin: 0 -1px 0 0;
    padding: 12px 6px 6px 6px;
  }
  .or-group > h4::before {
    margin-top: 14px;
  }

  .or,
  .or-group,
  .or-group-data,
  .or-repeat {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-align-content: flex-start;
    -ms-align-content: flex-start;
    -moz-align-content: flex-start;
    align-content: flex-start;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  .pages.or [role='page'].current:not(.question) {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }
  .pages.or [role='page'].current:not(.question) .or-group:not(.disabled),
  .pages.or [role='page'].current:not(.question) .or-group-data:not(.disabled),
  .pages.or [role='page'].current:not(.question) .or-repeat:not(.disabled) {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: wrap;
    -ms-flex-wrap: wrap;
    -moz-flex-wrap: wrap;
    flex-wrap: wrap;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
  }

  .or > .or-group,
  .or > .or-group-data {
    border-right: 1px solid black;
  }

  .or > #form-title + .or-group-data,
  .or > .disabled:first-of-type + .or-group-data,
  .or > .disabled:first-of-type ~ .disabled + .or-group-data {
    border-top: 1px solid black;
  }

  .or [role='page'] {
    border-top: 1px solid black;
  }

  .or > .question {
    border: 1px solid black;
    margin-left: -1px;
    margin-top: -1px;
  }

  .or-repeat:not(:empty) {
    border-bottom: 2px solid black;
  }

  .question {
    -webkit-flex: 100%;
    -ms-flex: 100%;
    flex: 100%;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    border-bottom: 1px solid black;
    border-left: 1px solid black;
    border-right: none;
    border-top: none;
    position: relative;
    margin: 0px;
    padding: 6px 6px 13px 6px;
  }

  /*
   * display: flex messes up img size so apply it sparingly only to questions
   * and not to notes. We loose the ability to display image labels nicely in
   * questions (though fine in tables). It also unfortunately prevents us from
   * displaying comment icons inline with labels.
   *
   * display: flex is used to:
   * - display error messages at the bottom of cells
   * - ... (other things probably)
   */
  .question {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
  }
  .question:not(.readonly):not(.focus):hover {
    background: #fffded;
  }
  .question.readonly {
    background: #eeeeee;
  }
  .question.focus {
    background: #fffad4;
  }
  .question .required {
    position: absolute;
    top: -2px;
    left: auto;
    right: 0;
    margin: 0 3px;
  }
  .question.invalid-constraint,
  .question.invalid-required {
    border-radius: 0;
    margin: 0px;
    padding: 6px 6px 13px 6px;
  }
  .question .question-label {
    text-transform: uppercase;
    font-weight: normal;
    font-size: 12px;
    width: calc(100% - 30px);
    order: 1;
  }
  .question .or-hint.active {
    order: 2;
  }
  .question audio,
  .question video,
  .question img {
    order: 3;
  }
  .question input[type='text'],
  .question input[type='tel'],
  .question input[type='password'],
  .question input[type='url'],
  .question input[type='email'],
  .question input[type='file'],
  .question input[type='date'],
  .question input[type='time'],
  .question input[type='datetime'],
  .question input[type='number'],
  .question textarea {
    width: 100%;
  }
  .question textarea {
    min-height: 68px;
  }
  .question .file-feedback {
    order: 4;
  }
  .question input:not(.ignore),
  .question textarea,
  .question select,
  .question .widget,
  .question .option-wrapper {
    order: 4;
  }
  .question .or-constraint-msg,
  .question .or-required-msg,
  .question .or-relevant-msg {
    order: 5;
  }
  .question .btn-comment {
    margin: 0 12px;
    top: 3px;
    order: 1;
  }

  .no-text-transform .question .question-label {
    text-transform: none;
    font-size: 14px;
  }

  .or[dir='rtl'] .question .required {
    right: auto;
    left: 0;
  }

  .or[dir='rtl'] .question legend .required {
    left: -6px;
    right: auto;
  }

  .touch input[type='text'],
  .touch input[type='tel'],
  .touch input[type='password'],
  .touch input[type='url'],
  .touch input[type='email'],
  .touch input[type='file'],
  .touch input[type='date'],
  .touch input[type='time'],
  .touch input[type='datetime'],
  .touch input[type='number'],
  .touch textarea,
  .touch select {
    border: none;
  }

  .or-hint.active {
    padding-top: 0;
    line-height: 12px;
  }

  .option-wrapper > label {
    margin-left: 0;
  }

  .or-repeat {
    margin: 0;
    padding: 0;
    background: #fef5ef;
  }
  .or-repeat .repeat-number {
    position: absolute;
    left: 100%;
    top: 0;
    padding-left: 4px;
    z-index: 10;
    height: auto;
    float: none;
    color: #bbb;
    font-size: 18px;
    font-weight: bold;
  }
  .or-repeat .repeat-buttons {
    width: calc(100% + 1px);
    margin-top: 0;
    height: 0px;
  }
  .or-repeat .remove {
    padding: 0;
    border: none;
    margin-top: -20px;
    margin-right: -20px;
  }

  .or[dir='rtl'] .or-repeat .repeat-number {
    right: 100%;
    left: auto;
    padding-left: 0;
    padding-right: 4px;
  }

  .or[dir='rtl'] .or-repeat .remove {
    margin-left: -20px;
  }

  .or-repeat-info:not(:empty) {
    flex: 100%;
    width: 100%;
    margin-right: -1px;
    border-bottom: 1px solid black;
    border-left: 1px solid black;
  }

  .or-group,
  .or-group-data,
  .or-repeat {
    -webkit-flex: 100%;
    -ms-flex: 100%;
    flex: 100%;
  }

  .question legend {
    line-height: 1.1em;
    margin-bottom: 8px;
  }
  .question legend .question-label {
    display: block;
  }
  .question legend .required {
    right: -6px;
  }
  .question legend .btn-comment {
    top: 0;
  }
  .question legend .btn-comment .icon,
  .question legend .btn-comment .android-chrome,
  .question
    legend
    .btn-comment
    .record-list__records__record[data-draft='true']::before,
  .question legend .btn-comment .enketo-geopoint-marker,
  .question legend .btn-comment .glyphicon-chevron-up,
  .question legend .btn-comment .glyphicon-chevron-down {
    position: static;
  }

  #form-title {
    width: calc(100% + 1px);
    color: #000 !important;
    border-right: 1px solid black;
    border-right-color: transparent;
    text-align: inherit;
  }

  .or-group > h4,
  .or-repeat > h4 {
    width: calc(100% + 1px);
    border-right: 1px solid black;
    border-right-color: transparent;
    /*border-bottom: 3px solid #ee7325;*/
    border-bottom: 3px solid #222;
    padding-bottom: 5px;
    margin-bottom: 0;
  }

  @media print, screen and (min-width: 600px) {
    .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(25% - 13px);
      -ms-flex-preferred-size: calc(25% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(25% - 13px);
    }
    .or-appearance-w1 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(50% - 13px);
      -ms-flex-preferred-size: calc(50% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(50% - 13px);
    }
    .or-appearance-w2 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(50% - 13px);
      -ms-flex-preferred-size: calc(50% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(50% - 13px);
    }
    .or-appearance-w2 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(75% - 13px);
      -ms-flex-preferred-size: calc(75% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(75% - 13px);
    }
    .or-appearance-w3 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(33.3333333333% - 13px);
      -ms-flex-preferred-size: calc(33.3333333333% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(33.3333333333% - 13px);
    }
    .or-appearance-w3 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(66.6666666667% - 13px);
      -ms-flex-preferred-size: calc(66.6666666667% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(66.6666666667% - 13px);
    }
    .or-appearance-w3 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w4 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(25% - 13px);
      -ms-flex-preferred-size: calc(25% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(25% - 13px);
    }
    .or-appearance-w4 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(50% - 13px);
      -ms-flex-preferred-size: calc(50% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(50% - 13px);
    }
    .or-appearance-w4 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(75% - 13px);
      -ms-flex-preferred-size: calc(75% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(75% - 13px);
    }
    .or-appearance-w4 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w5 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(20% - 13px);
      -ms-flex-preferred-size: calc(20% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(20% - 13px);
    }
    .or-appearance-w5 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(40% - 13px);
      -ms-flex-preferred-size: calc(40% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(40% - 13px);
    }
    .or-appearance-w5 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(60% - 13px);
      -ms-flex-preferred-size: calc(60% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(60% - 13px);
    }
    .or-appearance-w5 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(80% - 13px);
      -ms-flex-preferred-size: calc(80% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(80% - 13px);
    }
    .or-appearance-w5 .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w6 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w6 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(16.6666666667% - 13px);
      -ms-flex-preferred-size: calc(16.6666666667% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(16.6666666667% - 13px);
    }
    .or-appearance-w6 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(33.3333333333% - 13px);
      -ms-flex-preferred-size: calc(33.3333333333% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(33.3333333333% - 13px);
    }
    .or-appearance-w6 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(50% - 13px);
      -ms-flex-preferred-size: calc(50% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(50% - 13px);
    }
    .or-appearance-w6 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(66.6666666667% - 13px);
      -ms-flex-preferred-size: calc(66.6666666667% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(66.6666666667% - 13px);
    }
    .or-appearance-w6 .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(83.3333333333% - 13px);
      -ms-flex-preferred-size: calc(83.3333333333% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(83.3333333333% - 13px);
    }
    .or-appearance-w6 .or-appearance-w6 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w7 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w7 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(14.2857142857% - 13px);
      -ms-flex-preferred-size: calc(14.2857142857% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(14.2857142857% - 13px);
    }
    .or-appearance-w7 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(28.5714285714% - 13px);
      -ms-flex-preferred-size: calc(28.5714285714% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(28.5714285714% - 13px);
    }
    .or-appearance-w7 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(42.8571428571% - 13px);
      -ms-flex-preferred-size: calc(42.8571428571% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(42.8571428571% - 13px);
    }
    .or-appearance-w7 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(57.1428571429% - 13px);
      -ms-flex-preferred-size: calc(57.1428571429% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(57.1428571429% - 13px);
    }
    .or-appearance-w7 .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(71.4285714286% - 13px);
      -ms-flex-preferred-size: calc(71.4285714286% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(71.4285714286% - 13px);
    }
    .or-appearance-w7 .or-appearance-w6 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(85.7142857143% - 13px);
      -ms-flex-preferred-size: calc(85.7142857143% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(85.7142857143% - 13px);
    }
    .or-appearance-w7 .or-appearance-w7 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w8 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w8 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(12.5% - 13px);
      -ms-flex-preferred-size: calc(12.5% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(12.5% - 13px);
    }
    .or-appearance-w8 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(25% - 13px);
      -ms-flex-preferred-size: calc(25% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(25% - 13px);
    }
    .or-appearance-w8 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(37.5% - 13px);
      -ms-flex-preferred-size: calc(37.5% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(37.5% - 13px);
    }
    .or-appearance-w8 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(50% - 13px);
      -ms-flex-preferred-size: calc(50% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(50% - 13px);
    }
    .or-appearance-w8 .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(62.5% - 13px);
      -ms-flex-preferred-size: calc(62.5% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(62.5% - 13px);
    }
    .or-appearance-w8 .or-appearance-w6 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(75% - 13px);
      -ms-flex-preferred-size: calc(75% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(75% - 13px);
    }
    .or-appearance-w8 .or-appearance-w7 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(87.5% - 13px);
      -ms-flex-preferred-size: calc(87.5% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(87.5% - 13px);
    }
    .or-appearance-w8 .or-appearance-w8 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w9 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w9 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(11.1111111111% - 13px);
      -ms-flex-preferred-size: calc(11.1111111111% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(11.1111111111% - 13px);
    }
    .or-appearance-w9 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(22.2222222222% - 13px);
      -ms-flex-preferred-size: calc(22.2222222222% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(22.2222222222% - 13px);
    }
    .or-appearance-w9 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(33.3333333333% - 13px);
      -ms-flex-preferred-size: calc(33.3333333333% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(33.3333333333% - 13px);
    }
    .or-appearance-w9 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(44.4444444444% - 13px);
      -ms-flex-preferred-size: calc(44.4444444444% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(44.4444444444% - 13px);
    }
    .or-appearance-w9 .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(55.5555555556% - 13px);
      -ms-flex-preferred-size: calc(55.5555555556% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(55.5555555556% - 13px);
    }
    .or-appearance-w9 .or-appearance-w6 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(66.6666666667% - 13px);
      -ms-flex-preferred-size: calc(66.6666666667% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(66.6666666667% - 13px);
    }
    .or-appearance-w9 .or-appearance-w7 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(77.7777777778% - 13px);
      -ms-flex-preferred-size: calc(77.7777777778% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(77.7777777778% - 13px);
    }
    .or-appearance-w9 .or-appearance-w8 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(88.8888888889% - 13px);
      -ms-flex-preferred-size: calc(88.8888888889% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(88.8888888889% - 13px);
    }
    .or-appearance-w9 .or-appearance-w9 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w10 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
    .or-appearance-w10 .or-appearance-w1 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(10% - 13px);
      -ms-flex-preferred-size: calc(10% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(10% - 13px);
    }
    .or-appearance-w10 .or-appearance-w2 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(20% - 13px);
      -ms-flex-preferred-size: calc(20% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(20% - 13px);
    }
    .or-appearance-w10 .or-appearance-w3 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(30% - 13px);
      -ms-flex-preferred-size: calc(30% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(30% - 13px);
    }
    .or-appearance-w10 .or-appearance-w4 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(40% - 13px);
      -ms-flex-preferred-size: calc(40% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(40% - 13px);
    }
    .or-appearance-w10 .or-appearance-w5 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(50% - 13px);
      -ms-flex-preferred-size: calc(50% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(50% - 13px);
    }
    .or-appearance-w10 .or-appearance-w6 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(60% - 13px);
      -ms-flex-preferred-size: calc(60% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(60% - 13px);
    }
    .or-appearance-w10 .or-appearance-w7 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(70% - 13px);
      -ms-flex-preferred-size: calc(70% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(70% - 13px);
    }
    .or-appearance-w10 .or-appearance-w8 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(80% - 13px);
      -ms-flex-preferred-size: calc(80% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(80% - 13px);
    }
    .or-appearance-w10 .or-appearance-w9 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(90% - 13px);
      -ms-flex-preferred-size: calc(90% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(90% - 13px);
    }
    .or-appearance-w10 .or-appearance-w10 {
      -webkit-flex-grow: 1;
      flex-grow: 1;
      -webkit-flex-shrink: 1;
      flex-shrink: 1;
      -webkit-flex-basis: calc(100% - 13px);
      -ms-flex-preferred-size: calc(100% - 13px);
      -ms-flex-positive: 1;
      -ms-flex-negative: 1;
      flex-basis: calc(100% - 13px);
    }
  }

  @media print, screen and (min-width: 1100px) and (max-width: 1200px) {
    .paper .or .form-logo {
      margin-top: 0;
    }
  }

  .btn.remove,
  .vex.vex-theme-plain .remove.vex-dialog-button {
    margin-right: -26px;
    margin-left: -26px;
  }
  .btn.remove .icon,
  .vex.vex-theme-plain .remove.vex-dialog-button .icon,
  .btn.remove .android-chrome,
  .vex.vex-theme-plain .remove.vex-dialog-button .android-chrome,
  .btn.remove .record-list__records__record[data-draft='true']::before,
  .vex.vex-theme-plain
    .remove.vex-dialog-button
    .record-list__records__record[data-draft='true']::before,
  .btn.remove .enketo-geopoint-marker,
  .vex.vex-theme-plain .remove.vex-dialog-button .enketo-geopoint-marker,
  .btn.remove .glyphicon-chevron-up,
  .vex.vex-theme-plain .remove.vex-dialog-button .glyphicon-chevron-up,
  .btn.remove .glyphicon-chevron-down,
  .vex.vex-theme-plain .remove.vex-dialog-button .glyphicon-chevron-down {
    margin: 0 4px;
  }

  .form-header {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
    text-align: left;
    align-items: center;
  }
  .form-header__branding {
    order: 1;
    padding-right: 10px;
  }
  .form-header__branding .logo-wrapper {
    display: flex;
    align-items: flex-end;
  }
  .form-header__branding img {
    max-height: 30px;
    max-width: 130px;
  }
  .form-header__branding span {
    display: inline-block;
    color: #444444;
    font-weight: bold;
    font-size: 1.4em;
  }
  .form-header__branding span:hover {
    text-decoration: none;
    opacity: 0.8;
  }
  .form-header a.form-header__branding:hover {
    opacity: 0.8;
  }
  .form-header__filler {
    order: 20;
    flex: 1;
    min-width: 1px;
    min-height: 1px;
  }
  .form-header .form-language-selector {
    order: 30;
  }
  .form-header__button--print {
    background-image: url('data:image/svg+xml,%3Csvg%20version%3D%271.1%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20stroke%3D%27%2523{%24color}%27%20fill%3D%27%2523{%24color}%27%20width%3D%2734%27%20height%3D%2732%27%20viewBox%3D%270%200%2034%2032%27%3E%3Cpath%20d%3D%27M31.109%209.316h-27.423c-1.904%200-3.686%201.904-3.686%203.767v10.41h4.861v8.506h24.709v-8.506h4.861v-10.41c0-1.863-1.458-3.767-3.322-3.767zM27.139%2029.165h-19.848v-8.911h19.848v8.911zM31.19%2015.797h-2.835v-2.835h2.835v2.835z%27%3E%3C%2Fpath%3E%3Cpath%20d%3D%27M6.076%200h22.278v5.671h-22.278v-5.671z%27%3E%3C%2Fpath%3E%3C%2Fsvg%3E');
    background-size: 100%;
    order: 40;
    width: 32px;
    height: 30px;
    margin: 0;
    margin-left: 20px;
    margin-right: 0;
    outline: 0;
  }
  .form-header__button--homescreen {
    position: fixed;
    top: 1px;
    right: 0;
    order: 61;
  }
  .form-header__button--homescreen .icon,
  .form-header__button--homescreen .android-chrome,
  .form-header__button--homescreen
    .record-list__records__record[data-draft='true']::before,
  .form-header__button--homescreen .enketo-geopoint-marker,
  .form-header__button--homescreen .glyphicon-chevron-up,
  .form-header__button--homescreen .glyphicon-chevron-down {
    font-size: 25px;
  }
  .form-header .pages-toc {
    order: 70;
  }
  .form-header .pages-toc label[for='toc-toggle'] {
    background: repeating-linear-gradient(
      black 2px,
      black 5px,
      transparent 5px,
      transparent 12px
    );
  }

  .form-progress {
    position: fixed;
    top: 0;
    left: 0;
    display: block;
    max-width: 100% !important;
    width: 34px;
    min-width: 34px !important;
    margin: 0;
    height: 3px;
    background-color: #d15200;
    z-index: 1000;
    -webkit-transition: all 1s ease-out;
    transition: all 1s ease-out;
  }

  [dir='rtl'] .form-header {
    flex-direction: row-reverse;
  }

  [dir='rtl'] .offline-enabled {
    top: 0px;
  }

  [dir='rtl'] .form-progress {
    right: 0;
    left: auto;
  }

  .offline-enabled {
    display: block;
    position: fixed;
    top: 3px;
    left: 0;
  }
  .offline-enabled .offline-enabled__icon {
    width: 34px;
    height: 34px;
    background-color: #d15200;
    background-image: url('/images/offline-enabled.png');
    background-repeat: no-repeat;
    opacity: 1;
    -webkit-transition: opacity 3s ease-out;
    transition: opacity 3s ease-out;
  }
  .offline-enabled .offline-enabled__icon.not-enabled {
    height: 0;
    opacity: 0;
    width: 0;
    background: none;
  }
  .offline-enabled .offline-enabled__icon:hover {
    opacity: 0.8;
  }
  .offline-enabled .offline-enabled__queue-length {
    cursor: pointer;
    margin-top: 1px;
    width: 34px;
    min-height: 34px;
    color: #d15200;
    background-color: #ffffff;
    text-align: center;
    padding: 9.5px 0 9.5px 0;
    line-height: 15px;
    font-size: 15px;
    opacity: 1;
    -webkit-transition: opacity 3s ease-out;
    transition: opacity 3s ease-out;
  }
  .offline-enabled .offline-enabled__queue-length.hide {
    opacity: 0;
    display: none;
  }
  .offline-enabled .offline-enabled__queue-length.submitting {
    color: #ee7325;
  }
  .offline-enabled .offline-enabled__queue-length:hover {
    color: green;
  }

  #form-languages {
    display: none;
  }

  .form-language-selector {
    margin: 0;
  }
  .form-language-selector #form-languages {
    display: inline-block;
  }

  @media screen and (max-width: 1200px) {
    .offline-enabled {
      position: static;
      display: inline-block;
      margin-right: 10px;
    }
    .offline-enabled__icon {
      float: left;
      display: block;
    }
    .offline-enabled__queue-length {
      margin-top: 0;
      float: left;
      display: block;
    }
  }

  @media screen and (max-width: 1100px) {
    .form-header {
      -webkit-flex-wrap: wrap;
      -ms-flex-wrap: wrap;
      -moz-flex-wrap: wrap;
      flex-wrap: wrap;
      padding: 0 16px 0 16px;
      border-bottom: none;
    }
    .form-header__branding {
      margin-top: 16px;
    }
    .form-header .form-language-selector {
      flex: 100%;
      order: 100;
      padding-bottom: 0;
      margin: 0 auto;
      min-width: 280px;
    }
    .form-header__button--print {
      display: none;
    }
    .form-header__button--homescreen {
      top: -2px;
      position: static;
      align-self: flex-start;
      margin-top: -1px;
      margin-right: 0;
    }
    #form-languages {
      margin: 0;
      width: 100%;
    }
    .or .form-logo img {
      margin-top: 25px;
    }
    .offline-enabled {
      align-self: flex-start;
      margin-left: -16px;
    }
    .offline-enabled .queue-length {
      background-color: whitesmoke;
    }
  }

  .form-footer {
    position: relative;
  }
  .form-footer__content {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    -moz-flex-direction: column;
    flex-direction: column;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
  }
  .form-footer__content__main-controls {
    flex: 1;
    margin: 30px auto;
    width: 100%;
    text-align: center;
    position: relative;
  }
  .form-footer__content__main-controls .btn,
  .form-footer__content__main-controls .vex.vex-theme-plain .vex-dialog-button,
  .vex.vex-theme-plain .form-footer__content__main-controls .vex-dialog-button {
    display: inline-block;
    min-width: 180px;
    position: static;
    min-height: 32px;
    margin-bottom: 30px;
    margin-left: 20px;
    margin-right: 20px;
  }
  .form-footer__content__main-controls .btn progress,
  .form-footer__content__main-controls
    .vex.vex-theme-plain
    .vex-dialog-button
    progress,
  .vex.vex-theme-plain
    .form-footer__content__main-controls
    .vex-dialog-button
    progress {
    margin: 0;
    padding: 0;
    width: 100%;
  }
  .form-footer__content__main-controls .draft {
    font-family: 'OpenSans', Arial, sans-serif;
    font-weight: normal;
    width: 100%;
    font-style: italic;
    text-align: center;
    display: block;
    border: none;
    flex: none;
    padding: 0;
    margin: 0 auto 20px auto;
    max-width: 250px;
  }
  .form-footer__content__main-controls .draft label {
    margin-left: 0;
    width: 100%;
  }
  .form-footer__content__main-controls .previous-page,
  .form-footer__content__main-controls .next-page {
    display: none;
  }
  .form-footer__content__main-controls .previous-page {
    position: absolute;
    left: 5px;
    bottom: 5px;
  }
  .form-footer__content__jump-nav {
    /*IE10*/
    display: -ms-flexbox;
    display: -webkit-flex;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    -moz-flex-direction: row;
    flex-direction: row;
    -webkit-flex-wrap: nowrap;
    -ms-flex-wrap: nowrap;
    -moz-flex-wrap: nowrap;
    flex-wrap: nowrap;
  }
  .form-footer__content__jump-nav .first-page,
  .form-footer__content__jump-nav .last-page {
    flex: 1;
    opacity: 0.7;
    border-radius: 0 !important;
    display: none;
    padding: 9px;
    margin-bottom: 0;
    float: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .form-footer__content__jump-nav .first-page {
    padding-left: 32px;
  }
  .form-footer__content__jump-nav .first-page:not(:hover) {
    border-right: none;
  }
  .form-footer__content__jump-nav .first-page::before {
    background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20version%3D%271.1%27%20stroke%3D%27%2523{%24color}%27%20fill%3D%27%2523{%24color}%27%20width%3D%2734%27%20height%3D%2732%27%20viewBox%3D%270%200%2034%2032%27%3E%3Cpath%20d%3D%27M34.07%2019.41v0.41c0%206.61-5.37%2011.97-11.97%2012.18l0.83-0.83c-1.03-1.44-0.62-1.65%200-4.13l-0.83-0.83c3.3%200%206.19-2.89%206.19-6.19v-0.62c0-3.51-2.68-6.19-6.4-6.19h-11.97l2.48%202.27c1.03%201.24%201.03%203.1%200%204.13-0.62%200.41-1.24%200.83-2.06%200.83s-1.44-0.21-2.06-0.83l-7.43-7.23c-1.03-1.24-1.03-3.1%200-4.13l7.43-7.43c1.24-1.24%203.1-1.24%204.13%200%201.03%201.03%201.03%203.1%200%204.13l-2.48%202.48h11.77c6.81%200%2012.39%205.37%2012.39%2011.97zM5.99%2026.01h16.93v5.78h-16.93v-5.78zM15.28%2032h-8.26c-1.65%200-2.89-1.44-2.89-3.1s1.45-2.89%202.89-2.89h3.3z%27%2F%3E%3C%2Fsvg%3E');
    background-size: 100%;
    width: 17px;
    height: 16px;
    margin-top: 2px;
    margin-left: -22px;
    content: ' ';
    float: left;
  }
  .form-footer__content__jump-nav .last-page {
    padding-right: 32px;
  }
  .form-footer__content__jump-nav .last-page::before {
    background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20version%3D%271.1%27%20stroke%3D%27%2523{%24color}%27%20fill%3D%27%2523{%24color}%27%20width%3D%2747%27%20height%3D%2732%27%20viewBox%3D%270%200%2047%2032%27%3E%3Cpath%20d%3D%27M21.56%2029.5c-0.68-0.68-0.91-1.36-0.91-2.27s0.23-1.59%200.91-2.27l5.67-5.67h-24.06c-1.82%200-3.18-1.59-3.18-3.4s1.36-3.18%203.18-3.18h24.06l-5.67-5.67c-0.68-0.68-0.91-1.36-0.91-2.27s0.23-1.59%200.91-2.27c1.36-1.13%203.4-1.13%204.54%200l11.12%2011.12c0.23%200.23%200.23%200.23%200.45%200.45%200.68%200.91%200.68%202.04%200.23%202.95-0.23%200.45-0.45%200.68-0.68%201.14l-11.12%2011.35c-1.36%201.14-3.4%201.14-4.54%200z%27%2F%3E%3Cpath%20d%3D%27M43.35%2032c-1.82%200-3.18-1.36-3.18-3.18v-25.64c0-1.82%201.36-3.18%203.18-3.18s3.18%201.36%203.18%203.18v25.42c0.23%201.82-1.36%203.4-3.18%203.4z%27%2F%3E%3C%2Fsvg%3E');
    background-size: 100%;
    width: 24px;
    height: 16px;
    margin-top: 2px;
    margin-right: -22px;
    content: ' ';
    float: right;
  }
  .form-footer .logout {
    width: 100%;
    display: block;
    margin-bottom: 30px;
    text-align: center;
  }
  .form-footer .enketo-power {
    position: static;
    margin: 0 auto 20px auto;
    left: auto;
    width: 100%;
    line-height: 25px;
  }
  .form-footer .enketo-power img {
    width: 51px;
  }

  .pages ~ .form-footer .form-footer__content__main-controls {
    margin-bottom: 0;
    margin-top: 0;
  }

  .pages ~ .form-footer.end .logout {
    margin-bottom: 50px;
  }

  @media screen and (min-width: 1100px) {
    .form-footer .enketo-power {
      position: absolute;
      bottom: -85px;
      right: 5px;
      width: auto;
    }
    .pages ~ .form-footer .enketo-power {
      bottom: -95px;
    }
  }

  .touch .form-footer .draft .option-wrapper > label {
    border: none !important;
    width: 100% !important;
  }

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    .form-footer__content__main-controls,
    .main,
    .main .paper,
    .paper > form {
      -ms-flex-basis: auto;
      flex-basis: auto;
      -ms-flex-shrink: 0;
      flex-shrink: 0;
    }
    .form__loader {
      min-height: 200px;
    }
    .question:not(.or-appearance-list-nolabel) .option-wrapper > label img {
      display: inline !important;
      pointer-events: none;
    }
  }

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    .question input[type='radio'],
    .question input[type='checkbox'] {
      opacity: 0;
    }
    .question input[type='radio'] + .option-label::before,
    .question input[type='checkbox'] + .option-label::before {
      display: inline-block;
      content: '';
      vertical-align: middle;
      width: 20px;
      height: 20px;
      margin-left: -30px;
      margin-right: 10px;
      margin-bottom: 0;
      margin-top: 0;
      border-width: 3px;
      border-style: solid;
      background-color: transparent;
    }
    .question input[type='checkbox'] + .option-label::before {
      border-radius: 0;
      border-color: #666666;
    }
    .question input[type='checkbox']:checked + .option-label::before {
      border-color: black;
      background-image: url('data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20stroke%3D%27black%27%20fill%3D%27black%27%20width%3D%2732%27%20height%3D%2732%27%20viewBox%3D%270%200%2032%2032%27%3E%3Cpath%20d%3D%27M25.1%2012.5l-3.4-3.3-8%208-2.9-3-3.4%203.4%206.3%206.3z%27%2F%3E%3C%2Fsvg%3E');
      background-size: 20px 20px;
      background-position: -3px;
    }
    .question input[type='radio'] + .option-label::before {
      border-radius: 10px;
      border-color: #666666;
    }
    .question input[type='radio']:checked + .option-label::before {
      border-color: black;
      background-image: radial-gradient(
        4px,
        black 0%,
        black 99%,
        transparent 100%
      );
    }
    .question input[type='checkbox']:focus + .option-label::before,
    .question input[type='radio']:focus + .option-label::before {
      outline: 0;
      -webkit-box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
      box-shadow: 0 0 0 1px #66afe9, 0 0 8px rgba(102, 175, 233, 0.6);
    }
    .question input[type='checkbox']:disabled + .option-label::before,
    .question input[type='checkbox'][readonly] + .option-label::before,
    .question input[type='radio']:disabled + .option-label::before,
    .question input[type='radio'][readonly] + .option-label::before {
      border-color: #737373;
    }
    .or-appearance-likert input[type='radio'] + .option-label::before,
    .or-appearance-likert input[type='checkbox'] + .option-label::before {
      display: block;
      position: relative;
      left: 50%;
      padding: 0;
      margin-left: -11px;
      background-color: white;
      z-index: 10;
      top: -27px;
      margin-bottom: -23px;
    }
    .question.or-appearance-label
      input[type='checkbox']
      + .option-label::before,
    .question.or-appearance-label input[type='radio'] + .option-label::before {
      display: none;
    }
    .question.or-appearance-list-nolabel input[type='checkbox'] + .option-label,
    .question.or-appearance-list-nolabel input[type='radio'] + .option-label {
      display: block;
      position: relative;
      text-indent: -500%;
      color: transparent;
      white-space: nowrap;
      min-width: 25px;
      min-height: 25px;
      overflow: hidden;
    }
    .question.or-appearance-list-nolabel
      input[type='checkbox']
      + .option-label::before,
    .question.or-appearance-list-nolabel
      input[type='radio']
      + .option-label::before {
      position: absolute;
      left: 50%;
      margin-left: -11px;
    }
    .or[dir='rtl'] input[type='radio'] + .option-label::before,
    .or[dir='rtl'] input[type='checkbox'] + .option-label::before {
      margin-left: 10px;
      margin-right: -30px;
    }
    .or[dir='rtl']
      .or-appearance-likert
      input[type='radio']
      + .option-label::before,
    .or[dir='rtl']
      .or-appearance-likert
      input[type='checkbox']
      + .option-label::before,
    .or[dir='rtl']
      .question.or-appearance-list-nolabel
      input[type='radio']
      + .option-label::before,
    .or[dir='rtl']
      .question.or-appearance-list-nolabel
      input[type='checkbox']
      + .option-label::before {
      right: 50%;
      margin-right: -11px;
    }
  }

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    input[type='radio'] + .option-label::before,
    input[type='checkbox'] + .option-label::before {
      border-width: 1px;
    }
    input[type='radio']:checked + .option-label::before,
    input[type='checkbox']:checked + .option-label::before {
      background-position: -1px;
    }
    input[type='radio']:checked + .option-label::before {
      background-position: 0;
    }
  }

  .question-label {
    p {
      display: inline;
      margin: 0;
    }
  }

  section {
    .disabled {
      display: none !important;
    }
  }

  .or-group {
    h4 {
      border-right: 1px solid black !important;
      border-right-color: transparent !important;
    }
  }

  .or-repeat {
    background: white !important;
  }

  h5 {
    font-weight: bold !important;
  }

  h4 {
    margin-top: 1em !important;
    color: #026cb6 !important;
  }

  label {
    h4 {
      margin-top: 5px !important;
      color: #4a4a4a !important;
    }
  }

  section {
    .or-group-data {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: stretch;
      width: 100%;
      label {
        select {
          width: 100%;
          font-size: 13px;
        }
      }
    }
  }

  .question {
    border-right: 1px solid black !important;
  }

  .pages.or [role='page'].current:not(.question) {
    border: none !important;
  }

  .form-footer {
    min-height: 5em;
  }
`;
