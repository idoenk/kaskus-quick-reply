// ==UserScript==
// @name           Kaskus Quick Reply (Evo)
// @icon           https://github.com/idoenk/kaskus-quick-reply/raw/master/assets/img/kqr-logo.png
// @version        5.3.7.6
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_deleteValue
// @grant          GM_xmlhttpRequest
// @grant          GM_log
// @connect        githubusercontent.com
// @connect        greasyfork.org
// @namespace      http://userscripts.org/scripts/show/KaskusQuickReplyNew
// @dtversion      1603125376
// @timestamp      1462977849732
// @homepageURL    https://greasyfork.org/scripts/96
// @require        https://ajax.googleapis.com/ajax/libs/jquery/2.1.0/jquery.min.js
// @description    provide a quick reply feature, under circumstances capcay required.
// @include        /^https?://www.kaskus.co.id/thread/*/
// @include        /^https?://www.kaskus.co.id/lastpost/*/
// @include        /^https?://www.kaskus.co.id/post/*/
// @include        /^https?://www.kaskus.co.id/show_post/*/
// @include        /^https?://www.kaskus.co.id/group/discussion/*/
// @include        /^https?://fjb.kaskus.co.id/(thread|product|post)\b/*/
// @author         Idx
// @exclude        /^https?://www.kaskus.co.id/post_reply/*/
// @contributor    S4nJi, riza_kasela, p1nk3d_books, b3g0, fazar, bagosbanget, eric., bedjho, Piluze, intruder.master, Rh354, gr0, hermawan64, slifer2006, gzt, Duljondul, reongkacun, otnaibef, ketang8keting, farin, drupalorg, .Shana, t0g3, & all-kaskuser@t=3170414
// @include        http://cubeupload.com/*
// @include        http://imagevenue.com/*
// @license        (CC) by-nc-sa 3.0
// @run-at         document-end
//
// -!--latestupdate
//
// v5.3.7.6 - 2016-05-11 . 1462977849732
//   Patch jump around textarea on [enter,backspace,delete]
//   Keep notify_wrap visible on minimized QR
//   Init QR minimized to avoid getting focused
//   Add @connect host: [githubusercontent.com, greasyfork.org]
//   Hide QuickQuote button when no quoted post in current page
//   Autocomplete KPlus emotes with [IMG][/IMG]
// 
// -/!latestupdate---
// ==/UserScript==
//
// v5.3.7.5 - 2016-03-11 . 1457608034623
//   Patch QuickQuote parse shortcode kaskus smilies; store full-path smilies to localstorage;
// 
// v5.3.7.4 - 2016-03-10 . 1457559140131
//   Default use img bbcode for kaskus plus exclusive
// 
// v5.3.7.3 - 2016-03-10 . 1457556636122
//   Reactivate KPlus Exclusive with IMG BBCode
//   Patch FJB preview_post_ajax not rendering smilies
// 
// v5.3.7.2 - 2016-03-10 . 1457555538331
//   Hotfix: match/unmatch find smilies
// 
// v5.3.7 - 2016-03-10 . 1457549755373
//   Autocomplete smiley settings;
//   css update.
//   AtWho switch to IMG BBCode on kplus smilies (regular user);
//   At.js, a github-like autocomplete library :s
//   deprecated key:IMGBBCODE_KASKUS_PLUS; non-donat will always be with imgbbcode;
//   normalize asset sub-domain for smilies.
//
//
// v0.1 - 2010-06-29
//   Init
// --
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0 License
// http://creativecommons.org/licenses/by-nc-sa/3.0/deed.ms
// --------------------------------------------------------
// ==/UserScript==
(function () {

function main(mothership){
// Initialize Global Variables
var gvar = function(){};

gvar.sversion = 'v' + '5.3.7.6';
gvar.scriptMeta = {
   // timestamp: 999 // version.timestamp for test update
   timestamp: 1462977849732 // version.timestamp
  ,dtversion: 1603125376 // version.date

  ,titlename: 'Quick Reply'
  ,scriptID: 80409 // script-Id
  ,scriptID_GF: 96 // script-Id @Greasyfork
  ,cssREV: 1602215370 // css revision date; only change this when you change your external css
}; gvar.scriptMeta.fullname = 'Kaskus ' + gvar.scriptMeta.titlename;
/*
window.alert(new Date().getTime());
*/
//=-=-=-=--=
//========-=-=-=-=--=========
gvar.__DEBUG__ = !1; // development debug, author purpose
gvar.__CLIENTDEBUG__ = !1; // client debug, w/o using local assets
gvar.$w = window;

//========-=-=-=-=--=========
//=-=-=-=--=

// predefined registered key_save
var KS = 'KEY_SAVE_',
  GMSTORAGE_PATH  = 'GM_',
  OPTIONS_BOX = {
     KEY_SAVE_LAST_UPLOADER: [''] // last used host-uploader

    ,KEY_SAVE_UPDATES:          ['1'] // check update
    ,KEY_SAVE_UPDATES_INTERVAL: ['1'] // update interval, default: 1 day
    ,KEY_SAVE_QR_DRAFT:         ['1'] // activate qr-draft
    ,KEY_SAVE_CUSTOM_SMILEY:    ['']  // custom smiley, value might be very large; limit is still unknown 
    ,KEY_SAVE_QR_HOTKEY_KEY:    ['1,0,0'] // QR hotkey, Ctrl,Shift,Alt
    ,KEY_SAVE_QR_HOTKEY_CHAR:   ['Q'] // QR hotkey, [A-Z]

    ,KEY_SAVE_TXTCOUNTER:       ['1'] // text counter flag
    ,KEY_SAVE_ELASTIC_EDITOR:   ['0'] // force editor to keep elastic
    ,KEY_SAVE_FIXED_TOOLBAR:    ['1'] // auto fixed toolbar

    ,KEY_SAVE_SHOW_SMILE:       ['0,kecil'] // [flag,type] of autoshow_smiley
    ,KEY_SAVE_TABFIRST_SMILE:   ['kecil'] // first tab of smilies, preference of first load
    ,KEY_SAVE_AUTOCOMPLETE_SML: ['1,kecil,besar,kplus'] // autocomplete smilies
    ,KEY_SAVE_LAYOUT_CONFIG:    ['']  // flag of template_on
    ,KEY_SAVE_LAYOUT_TPL:       ['']  // template layout, must contain: "{message}". eg. [B]{message}[/B]
    ,KEY_SAVE_THEME_FIXUP:      ['']  // theme fixer, hack css theme for viewing purpose
    ,KEY_SAVE_HIDE_GREYLINK:    ['1'] // hide grey origin link
    ,KEY_SAVE_ALWAYS_NOTIFY:    ['1'] // activate user notification
    ,KEY_SAVE_SHOW_KASKUS_PLUS: ['1'] // show kaskus plus smiley
    ,KEY_SAVE_IMGBBCODE_KASKUS_PLUS: ['1'] // use img bbcode for kaskus plus smiley

    ,KEY_SAVE_SCUSTOM_NOPARSE:  ['0'] // dont parse custom smiley tag. eg. tag=babegenit. BBCODE=[[babegenit]

    ,KEY_SAVE_TMP_TEXT:     ['']  // temporary text before destroy maincontainer 
    ,KEY_SAVE_QR_LastUpdate:['0'] // lastupdate timestamp

    ,KEY_SAVE_UPLOAD_LOG:  [''] // history upload (kaskus)
    ,KEY_SAVE_SMILIES_BULK:  [''] // bulk of smilies
    ,KEY_SAVE_CSS_BULK:  [''] // bulk of ext css
    ,KEY_SAVE_CSS_META:  [''] // meta of css [filename;lastupdate]
  }
;


var GM_addGlobalScript = function (a, b, c) {
  var d = createEl("script", { type: "text/javascript"});
  if (isDefined(b) && isString(b)) d.setAttribute("id", b);
  if (a.match(/^https?:\/\/.+/)) d.setAttribute("src", a);
  else d.appendChild(createTextEl(a));
  if (isDefined(c) && c) {
    document.body.insertBefore(d, document.body.firstChild)
  } else {
    var e = document.getElementsByTagName("head");
    if (isDefined(e[0]) && e[0].nodeName == "HEAD") gvar.$w.setTimeout(function () {
      e[0].appendChild(d)
    }, 100);
      else document.body.insertBefore(d, document.body.firstChild)
    }
  return d
};
var GM_addGlobalStyle = function (a, b, c) {
  var d, e;
  if (a.match(/^https?:\/\/.+/)) {
    d = createEl("link", { type: "text/css", rel:'stylesheet', href:a });
  }else{
    d = createEl("style", { type: "text/css" });
    d.appendChild(createTextEl(a));
  }
  if (isDefined(b) && isString(b)) d.setAttribute("id", b);
  if (isDefined(c) && c) {
    document.body.insertBefore(d, document.body.firstChild)
  } else {
    e = document.getElementsByTagName("head");
    if (isDefined(e[0]) && e[0].nodeName == "HEAD") gvar.$w.setTimeout(function () {
      e[0].appendChild(d)
    }, 100);
    else document.body.insertBefore(d, document.body.firstChild)
  }
  return d
};

// Native Get Elements
var $D=function (q, root, single) {
  if (root && typeof root == 'string') {
    root = $D(root, null, true);
    if (!root) { return null; }
  }
  if( !q )
    return false;
  if ( typeof q == 'object')
    return q;
  root = root || document;
  if (q[0]=='/' || (q[0]=='.' && q[1]=='/')) {
    if (single) {
      return document.evaluate(q, root, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    }
    return document.evaluate(q, root, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  } else if (q[0]=='.') {
    return root.getElementsByClassName(q.substr(1));
  } else {
    return root.getElementById( q[0]=='#' ? q.substr(1) : q.substr(0) );
  }
};
// native add - remove element
var Dom = {
  g: function(el) {
    if(!el) return false;
    return ( isString(el) ? document.getElementById(el) : el );
  },
  add: function(el, dest) {    
    var el = this.g(el);
    var dest = this.g(dest);
    if(el && dest) dest.appendChild(el);
  },
  remove: function(el) {
    var el = this.g(el);
    if(el && el.parentNode)
    el.parentNode.removeChild(el);
  },
  Ev: function() {
    if (window.addEventListener) {
      return function(el, type, fn, ph) {
        if(typeof(el)=='object')
        this.g(el).addEventListener(type, function(e){fn(e);}, (isUndefined(ph) ? false : ph));
      };      
    }else if (window.attachEvent) {
      return function(el, type, fn) {
        var f = function() { fn.call(this.g(el), window.event); };
        this.g(el).attachEvent('on' + type, f);
      };
    }
  }()
};


//=== reSRC
var rSRC = {
  mCls: ['markItUpButton','markItUpDropMenu','<li class="markItUpSeparator">---------------</li>'],
  menuFont: function(id){
    var li_cls = rSRC.mCls, item, buff, lf;
    //item = ['Arial','Arial Black','Arial Narrow','Book Antiqua','Century Gothic','Comic Sans MS','Courier New','Georgia','Impact','Lucida Console','Times New Roman','Trebuchet MS','Verdana'], 

    item = ['Arial','Georgia','Arial Black','Impact','Arial Narrow','Lucida Console','Book Antiqua','Times New Roman','Century Gothic','Trebuchet MS','Comic Sans MS','Verdana','Courier New'];
    lf = item.length;
    buff='<li class="'+li_cls[0]+' '+li_cls[0] + id + ' fonts '+li_cls[1]+'"><a title="Fonts" href="" data-noevent="1">F</a>';
    buff+='<ul class="markItUpButton'+id+'-wrapper mtarrow" data-bb="FONT">';
    for(var i=0; i<lf; i++)
      buff += ''
        +'<li class="'+li_cls[0]+' '+li_cls[0] + id +'-'+(i+1)+' font-'+item[i].toLowerCase().replace(/\s/g,'')+'">'
        +'<a title="'+item[i]+'" class="ev_font" href="">'+item[i]+'</a>'
        +'</li>';
    buff+='</ul></li>';
    return buff;
  },
  menuSize: function(id){
    var li_cls = rSRC.mCls, buff;
    buff='<li class="'+li_cls[0]+' '+li_cls[0] + id + ' size '+li_cls[1]+'"><a title="Size" href="" data-noevent="1">Size</a>';
    buff+='<ul class="markItUpButton'+id+'-wrapper mtarrow" data-bb="SIZE">';
    for(var i=1; i<=7; i++)
      buff+='<li class="'+li_cls[0]+' size-'+i+'"><a title="'+i+'" class="ev_size" href="">'+i+'</a></li>';
    buff+='</ul></li>';
    return buff;
  },
  menuColor: function(id){
    var li_cls = rSRC.mCls, buff, capt, kolors = rSRC.getSetOf('color');
    buff='<li class="'+li_cls[0] + ' ' + li_cls[0] + id + ' ' + li_cls[1]+'"><a title="Colors" href="" data-noevent="1">Colors</a>';
    buff+='<ul class="markItUpButton'+id+'-wrapper mtarrow" data-bb="COLOR">';
    for(hex in kolors){
      capt = kolors[hex];
      buff+='<li class="'+li_cls[0] +'"><a title="'+capt+'" class="ev_color"  style="width:0; background-color:'+hex+'" href="">'+capt+'</a></li>';
    }
    buff+='</ul></li>';
    return buff;
  },
  menuGen: function(mnuData){
    var mCls = rSRC.mCls;
    var mnu, addcls, buff = '', cls_sp = "markItUpSeparator";
    for(var i=0, iL=mnuData.length; i<iL; i++){
      mnu = mnuData[i];
      if( mnu["id"] ){
        if( "function" == typeof mnu["cb"] )
          buff += mnu["cb"]( mnu["id"] );
        else
          buff += ''
            +'<li class="'+mCls[0]+' '+mCls[0]+mnu["id"]+'">'
            +'<a href="" title="'+mnu["title"]+'" class="'+mnu["class"]+'"'
              +(mnu["bb"] ? ' data-bb="'+mnu["bb"]+'"' : '')
              +(mnu["shortcut"] && mnu["shortcut"]["key"] && mnu["shortcut"]["csa"] ? ''
                +' data-shortcut=\'{"key":"'+mnu["shortcut"]["key"]+'","csa":"'+mnu["shortcut"]["csa"]+'"}\''
               : '' // no-shortcut
              )
            +'></a>'
            +'</li>'
          ;
      }
      else{
        addcls = (mnu["class"] ? mnu["class"] : "");
        if( addcls )
          buff += mCls[2].replace(cls_sp, cls_sp+" "+addcls);
        else
          buff += mCls[2];
      }
    }
    return buff;
  },
  menuIcon: function () {
    var c = rSRC.mCls, d = "", e = 0, f = "img/icons/new/", g = rSRC.getSetOf('posticon');
    d = '<ul id="menu_posticon" class="mnu-icons relative mtarrow" style="display:none;">';
    for (icon in g) {
      d += '<li><a title="'+icon+'" href="javascript:;" data-id="' + e + '">' 
      + (g[icon] ? '<img src="' + gvar.kkcdn + f + g[icon] + '" />' : "No Icon") + "</a></li>";
      e++
    }
    d += "</ul>";
    return d
  },

  menuTestFoo: function(){
    var menus = ['.fa-bars','.fa-search','.fa-arrow-circle-right','.fa-eye-slash','.fa-eye','.fa-facebook','.fa-twitter','.fa-google-plus','.fa-star','.fa-gear','.fa-caret-down','.fa-chain','.fa-calendar','.fa-envelope','.fa-pencil','.fa-check','.fa-archive','.fa-backward','.fa-forward','.fa-users','.fa-google','.fa-exclamation-circle','.fa-info-circle','.fa-comments','.fa-reply','.fa-edit','.fa-comment','.fa-angle-right','.fa-photo','.fa-phone','.fa-bookmark','.fa-sliders','.fa-thumb-tack','.fa-chevron-down','.fa-chevron-up','.fa-file','.fa-plus-circle','.fa-chevron-circle-down','.fa-times','.fa-user','.fa-align-left','.fa-align-center','.fa-align-right','.fa-mail-squared','.fa-list-ul','.fa-list-ol','.fa-code','.fa-underline','.fa-bold','.fa-italic','.fa-soundcloud','.fa-unlink','.fa-vimeo-square','.fa-youtube','.fa-outdent','.fa-indent','.fa-quote-left','.fa-times-circle-o','.fa-check-square-o','.fa-expand','.fa-heart','.fa-trash-o','.fa-home','.fa-clock-o','.fa-lock','.fa-tags','.fa-check-circle','.fa-question-circle','.fa-arrow-left','.fa-arrow-right','.fa-mail-forward','.fa-share-alt','.fa-trash','.fa-power-off','.fa-chevron-circle-up','.fa-font','.fa-chevron-right','.fa-chevron-left','.fa-angle-down','.fa-map-marker'];
    var buff = '', name;
    for(var i=0, iL= menus.length; i<iL; i++){
      name = menus[i].replace(/\./,'');
      buff += '<a href="#" title="'+name+'"><i class="fa '+name+'"></i></a>&nbsp;';
    }
    return buff;
  },
  

  getTPL: function(){
    var 
      _sp = rSRC.mCls[2],
      lc = rSRC.mCls[0],
      iner_head = '<span class="inner_title">'+gvar.inner.reply.title+ '</span> &nbsp;<a class="qrlink" target="_blank" href="'+'https://greasyfork.org/scripts/'+gvar.scriptMeta.scriptID_GF+'">'+gvar.sversion+'</a>'
    ;
    return ''
      +'<div id="' + gvar.qID + '" class="row xkqr reply-form'+(gvar.readonly ? ' hide':'')+'">' 
      + '<div class="entry-head bar0">'
      +  '<div class="inner-entry col-xs-4 lefty">'+iner_head+'</div>'
      +  '<div class="inner-entry col-xs-8 righty">'
      +   '<div class="navbar-right">'
      +    '<div id="draft_desc">blank</div>'
      +    '<div id="qrdraft" class="goog-btn goog-btn-default goog-btn-disabled">Draft</div>'
      +    '<div id="settings-button" title="Settings" class="goog-btn goog-btn-default goog-btn-flat"><i class="fa fa-gear fa5"></i></div>'
      +    '<div id="qrtoggle-button" title="Toggle QR" class="goog-btn goog-btn-default goog-btn-flat"><i class="fa fa-chevron-up"></i></div>'
      +   '</div>' // .navbar-right
      +  '</div>'
      + '</div>' // .entry-head

      + '<div class="reply-thread">'
      + '<div id="notify_wrap" class="icon-button" style="display:none; ">'
      +  '<div class="notify_box">'
      +    '<div class="g_notice" id="notify_msg"></div>'
      +    '<div class="qr-m-panel">'
      +     '<a id="scancel_edit" class="goog-btn goog-btn-default goog-btn-xs" style="display:none;">Discard Edit</a>'
      +     '<span id="quote_btnset" style="display:none;">'
      +      '<a id="squote_post" class="goog-btn goog-btn-default goog-btn-xs '+(gvar.readonly ? ' goog-btn-disabled':'')+'" title="Fetch Quote [Alt+Q]">Fetch Quote</a>&nbsp;&nbsp;'
      +      '<a id="squick_quote" class="goog-btn goog-btn-default goog-btn-xs" title="Quick Quote [Alt+C]">Quick Quote</a>'
      +     '</span>'
      +    '</div>' // .qr-m-panel
      +  '</div>' // .notify_box
      + '</div>' // #notify_wrap

      + '<div id="formqr">'

      + '<form method="post" id="formform" role="form" name="qr_form" action="#">'
        // hidden-values
      + '<input type="hidden" value="" name="securitytoken" id="qr-securitytoken"/>' 
      + '<input type="hidden" value="" name="g-recaptcha-response" id="qr-g-recaptcha-response"/>'

      + (gvar.thread_type == 'group' ? ''
        +'<input type="hidden" value="" name="discussionid" id="qr-discussionid" />'
        +'<input type="hidden" value="" name="groupid" id="qr-groupid" />'
        : '')
      + '<input type="hidden" value="Preview Post" name="preview"/>' 
      + '<input type="hidden" value="1" name="parseurl"/>' 
      + '<input type="hidden" value="9999" name="emailupdate"/>' 
      + '<input type="hidden" value="0" name="folderid"/>' 
      + '<input type="hidden" value="0" name="rating"/>' 
      + '<input id="hid_iconid" type="radio" name="iconid" value="0" class="demon" />'

      + '<div class="form-group wrap-markItUpHeader">'
      + '<div class="message">'
      + '<div class="markItUp" id="markItUpReply-messsage">'




      // title-message
      + '<div id="kqr-title_message" class="miu-unit tm relative" style="display:none">'
      +  '<input id="fakefocus_icon" type="text" class="demon" />'

      +  '<div class="tm-sub col-xs-8 forum-title">'
      +   '<div class="form-group">'
      +     '<div class="input-group">'
      +        '<ul class="ulpick_icon">'
      +        '<li id="pick_icon" class="modal-dialog-title-pickicon goog-btn goog-btn-default" title="Pick Icon">'
      +         '<img id="img_icon" src="'+gvar.B.nocache_png+'" style="display:none;" />'
      +        '</li>'
      +         rSRC.menuIcon()
      +        '</li></ul>'
      +        '<div class="ts_fjb-type" style="display:none;">'
      +        '<select name="prefixid" class="form-control selectbox" title="Status Item">'
      +         '<option value="0">( no prefix )</option>'
      +         '<option value="SOLD">TERJUAL</option>'
      +         '<option value="WTB">BELI</option>'
      +         '<option value="WTS">JUAL</option>'
      +        '</select>'
      +        '</div>'
      +        '<input id="form-title" type="text" name="title" class="form-control twt-glow form-title" title="Message Title" placeholder="'+gvar.def_title+'" autocomplete="off" />'
      +        '<span id="close_title" class="kqr-icon-close" title="Remove Title Message" style="display:none;" />'
      +     '</div>'
      +   '</div>' // fg
      +  '</div>' // .forum-title

          // title on fjb-thread
      +  '<div class="tm-sub col-xs-2 ts_fjb-price" style="display:none;">'
      +   '<div class="form-group">'
      +     '<div class="input-group">'
      +        '<div class="input-group-addon" title="Price (Rp)"><i class="icon-shopping-cart"></i></div>'
      +        '<input id="form-price" type="text" class="form-control twt-glow" title="Harga" name="harga" placeholder="Harga, eg. 30000" style="margin-left: 1px;" />'
      +     '</div>'
      +   '</div>' // fg
      +  '</div>' // .ts_fjb-price
      +  '<div class="tm-sub col-xs-2 title-righty">'
      +   '<div class="ts_fjb-kondisi" style="display:none;">'
      +   '<select name="kondisi" class="form-control selectbox" title="Kondisi Barang">'
      +    '<option value="1">New</option>'
      +    '<option value="2">Second</option>'
      +    '<option value="4">Refurbished</option>'
      +   '</select>'
      +   '</div>'
      +  '</div>' // .title-righty

      +  '<div class="clearfix"></div>'
      + '</div>' // .miu-unit.tm



      + '<div class="markItUpContainer">'
      + '<div class="miu-unit markItUpHeader">'
      + '<ul>'
      + '<li class="' + lc + " " + lc + '96"><a id="mnu_add_title" class="ev_addtitle" title="Add Title Message" href="">Add Title Message</a></li>'
      
      + rSRC.menuGen([
        {id:null, 'class': 'sp_add_title'}, // spacer
        {id:1, 'class': 'ev_biu', bb: 'B', title: 'Bold [Ctrl+B]', shortcut: {key: 'B', csa: 'ctrl'}},
        {id:2, 'class': 'ev_biu', bb: 'I', title: 'Italic [Ctrl+I]', shortcut: {key: 'I', csa: 'ctrl'}},
        {id:3, 'class': 'ev_biu', bb: 'U', title: 'Underline [Ctrl+U]', shortcut: {key: 'U', csa: 'ctrl'}},
        {id:null}, // spacer
        {id:4, 'class': 'ev_align', bb: 'LEFT', title: 'Align Left'},
        {id:5, 'class': 'ev_align', bb: 'CENTER', title: 'Align Center [Ctrl+E]', shortcut: {key: 'E', csa: 'ctrl'}},
        {id:6, 'class': 'ev_align', bb: 'RIGHT', title: 'Align Right [Ctrl+R]', shortcut: {key: 'R', csa: 'ctrl'}},
        {id:null}, // spacer
        {id:7, 'class': 'ev_list', bb: 'LIST-bullet', title: 'Bulleted list'},
        {id:8, 'class': 'ev_list', bb: 'LIST-numeric', title: 'Numeric list'},
        {id:9, 'class': 'ev_indent', bb: 'INDENT', title: 'Increase Indent'},
        {id:null}, // spacer
        {id:11, 'class': 'ev_custom', bb: 'URL', title: 'Insert Link [Ctrl+L]', shortcut: {key: 'L', csa: 'ctrl'}},
        {id:13, 'class': 'ev_custom', bb: 'EMAIL', title: 'Insert Email Link'},
        {id:14, 'class': 'ev_custom', bb: 'IMG', title: 'Picture [Ctrl+P]', shortcut: {key: 'P', csa: 'ctrl'}},
        {id:null}, // spacer
        {id:15, 'class': 'ev_custom', bb: 'QUOTE', title: 'Wrap [QUOTE] around text'},
        {id:16, 'class': 'ev_custom', bb: 'CODE', title: 'Wrap [CODE] around text'},
        {id:50, 'class': 'ev_custom', bb: 'HTML', title: 'Wrap [HTML] around text'},
        {id:51, 'class': 'ev_custom', bb: 'PHP', title: 'Wrap [PHP] around text'},
        {id:null}, // spacer
        {id:95, 'class': 'ev_color', cb: rSRC.menuColor},
        {id:19, 'class': 'ev_font', cb: rSRC.menuFont},
        {id:20, 'class': 'ev_size', cb: rSRC.menuSize},
        {id:null}, // spacer
        {id:21, 'class': 'ev_custom', bb: 'SPOILER', title: 'Wrap [SPOILER] around text'},
        {id:97, 'class': 'ev_custom', bb: 'TRANSPARENT', title: 'Wrap [TRANSPARENT] around text'},
        {id:52, 'class': 'ev_custom', bb: 'NOPARSE', title: 'Wrap [NOPARSE] around text'},
        {id:53, 'class': 'ev_custom', bb: 'STRIKE', title: 'Strikethrough text'},
        {id:null}, // spacer
        {id:22, 'class': 'ev_custom', bb:'YOUTUBE', title: 'Embedding video from Youtube'},
        {id:23, 'class': 'ev_custom', bb:'VIMEO', title: 'Embedding video from Vimeo'},
        {id:24, 'class': 'ev_custom', bb:'SOUNDCLOUD', title: 'Embedding audio from Soundcloud'},
      ])

      + _sp 
      + '<li class="' + lc + " " + lc + '99 "><a class="ev_smiley" title="Smiley List" href="" aria-label="Smiley List "></a></li>'
      + '<li class="' + lc + " " + lc + '98 "><a class="ev_upload" title="Uploader" href="" aria-label="Uploader"></a></li>' 
      + '</ul>'
      + '<div id="qr_plugins_container"></div>'
      + '</ul>'
      + '</div>' // .miu-unit.markItUpHeader

      + ''
      + '</div>' // .markItUpContainer
      + '</div>' // #markItUpReply-messsage
      + '</div>' // .message
      + '</div>' // .form-group.wrap-markItUpHeader

      + '<div class="form-group fg-message">'
      +  '<span id="clear_text" class="kqr-icon-close" title="Clear Editor" style="display:none"/>'
      +  '<textarea id="kqr-reply-messsage" class="twt-glow kqr-editor" name="message" rows="2" cols="60" tabindex="1" dir="ltr"></textarea>'
      + '</div>' // .form-group.fg-message


      + '<div class="form-group fg-box-bottom">'
      +  '<div class="box-bottom" style="display:none">'
      +   '<div class="box-smiley" style="display:none">'
      +     '<div role="tabpanel">'
      +      '<ul class="nav nav-tabs" role="tablist">'
      +       '<li><a href="#tkecil" role="tab" data-toggle="tab">Kecil</a></li>'
      +       '<li><a href="#tbesar" role="tab" data-toggle="tab">Besar</a></li>'
      +       (gvar.settings.show_kaskusplus ? '<li><a href="#tkplus" role="tab" data-toggle="tab"><i class="icon icon-kplus"></i>Plus</a></li>':'')
      +       '<li><a href="#tcustom" role="tab" data-toggle="tab" class="green-tab">Custom</a></li>'
      +       '<li class="li-tabclose pull-right"><a href="javascript:;" class="close-tab"><i class="kqr-icon-close"></i></a></li>'
      +      '</ul>'
      +      '<div class="tab-content">'
      +       '<div class="tab-pane bbthumb" id="tkecil"></div>'
      +       '<div class="tab-pane bbthumb" id="tbesar"></div>'
      +       (gvar.settings.show_kaskusplus ? '<div class="tab-pane bbthumb" id="tkplus"></div>':'')
      +       '<div class="tab-pane" id="tcustom"></div>'
      +       '<div class="clearfix"></div>'
      +      '</div>' // .tab-content
      +     '</div>' // tabpanel
      +   '</div>' // .box-smiley

      +   '<div class="box-upload" style="display:none">'
      +     '<div role="tabpanel">'
      +      '<ul class="nav nav-tabs" role="tablist">'
      +      '<li class="active"><a href="#tupload" role="tab" data-toggle="tab">Uploader</a></li>'
      +      '<li class="li-tabclose pull-right"><a href="javascript:;" class="close-tab"><i class="kqr-icon-close"></i></a></li>'
      +      '</ul>'
      +      '<div class="tab-content">'
      +       '<div class="tab-pane active" id="tupload"></div>'
      +       '<div class="clearfix"></div>'
      +      '</div>' // .tab-content
      +     '</div>' // tabpanel
      +   '</div>' // .box-upload
      +  '</div>' // .box-bottom
      +  '<div class="clearfix"></div>'
      + '</div>' // .form-group.fg-box-bottom


      + '<div class="form-group fg-button-bottom">'

          // wrapper additional edit-options
      +   '<div class="edit-options goog-tab-content" style="display:none;">'
      +   '<div class="goog-btn goog-btn-default goog-btn-xs additional_opt_toggle" title="Additional Options"><i class="fa fa-bars"></i></div>'
      +   '<div class="row">'
      +   '<div class="edit-reason col-xs-11" style="display:none;">'
      +    '<div class="form-group">'
      +     '<div class="input-group">'
      +      '<div class="input-group-addon"><i class="fa fa-edit"></i></div>'
      +      '<input id="form-edit-reason" type="text" class="form-control twt-glow" name="reason" title="Reason" placeholder="Reason for editing" />'
      +     '</div>' // .input-group
      +    '</div>'
      +   '</div>' // .edit-reason
      +   '<div class="ts_fjb-tags col-xs-11" style="display:none;">'
      +    '<div class="form-group">'
      +     '<div class="input-group">'
      +      '<div class="input-group-addon"><i class="fa fa-bookmark"></i></div>'
      +      '<input id="form-tags" type="text" class="form-control twt-glow" name="tagsearch" title="Tags" placeholder="Eg: Electronics, Gadget, Cloths, etc" />'
      +     '</div>' // .input-group
      +    '</div>'
      +   '</div>' // .ts_fjb-tags
      +   '</div>' // row


      +   '<div id="additionalopts" class="additional-opts" style="display:none">'
      +   '<div class="row">'
      +     '<div class="col-xs-6 adt-item adt-subscription">'
      +      '<select name="emailupdate" class="form-control selectbox">'
      +       '<option value="9999">Do not subscribe</option>'
      +       '<option value="0">Without email notification</option>'
      +       '<option value="1">Instant email notification</option>'
      +      '</select>'
      +     '</div>' // .adt-subscription
      +     '<div class="col-xs-6 adt-item adt-subscription">'
      +      '<select name="folderid" id="folderid" class="form-control selectbox"></select>'
      +     '</div>' // .adt-subscription
      +    '</div>' // row
      +   '<div class="row">'
      +     '<div class="col-xs-6 adt-item adt-rating">'
      +      '<select name="rating" class="form-control selectbox">'
      +       '<option value="0">Rating</option>'
      +       '<option value="5">&#x2605;&#x2605;&#x2605;&#x2605;&#x2605; : Excellent!</option>'
      +       '<option value="4">&#x2605;&#x2605;&#x2605;&#x2605;&#x2606; : Good</option>'
      +       '<option value="3">&#x2605;&#x2605;&#x2605;&#x2606;&#x2606; : Average</option>'
      +       '<option value="2">&#x2605;&#x2605;&#x2606;&#x2606;&#x2606; : Bad</option>'
      +       '<option value="1">&#x2605;&#x2606;&#x2606;&#x2606;&#x2606; : Terrible</option>'
      +      '</select>'
      +     '</div>' // .adt-rating
      +     '<div class="col-xs-6 adt-item adt-converlink">'
      +      '<div class="checkbox">'
      +       '<label><input name="parseurl" id="parseurl" value="1" type="checkbox" /> Automatically convert links in text</label>'
      +      '</div>'
      +     '</div>' // .adt-converlink
      +    '</div>' // row
      +   '</div>' // #additionalopts
      +   '</div>' // .edit-options

          // helper fake-elements
          // remote signal from ifr-content before posting
      +   '<input id="qr_signsectok" type="button" class="ghost" value="sgt" />'

          // remote append from ifr-content
      +   '<input id="qr_getcont" type="button" class="ghost" value="gcf" />'
          // remote button to chkVal
      +   '<input id="qr_chkval" type="button" class="ghost" value="cv" />'
          // remote to check MultiQuote
      +   '<input id="qr_chkcookie" type="button" class="ghost" value="cq" onclick="try{chkMultiQuote()}catch(e){console && console.log && console.log(e)}" />'
          // remote button to delete-mQ
      +   '<input id="qr_remoteDC" type="button" class="ghost" value="dc" onclick="try{deleteMultiQuote()}catch(e){console && console.log && console.log(e)}" />'
          // remote button to inject-mQ
      +   '<input id="qr_remoteIC" type="button" class="ghost" value="ic" onclick="try{injectMultiQuote()}catch(e){console && console.log && console.log(e)}" />'
      + '</div>' // .form-group.fg-button-bottom


      + '<div class="form-group fg-button-submit">'
          // text-counter
      +  '<span class="counter" style="'+(gvar.settings.txtcount ? '':'none')+'"><i>Characters left:</i> <tt class="numero">' + (gvar.thread_type == 'group' ? '1000' : '20000') + '</tt> <b class="qr_preload" style="display:none" title="Est. layout-template"></b></span>'
      +  '<div class="col-xs-8 col-xs-offset-2 wrap-button-submit">'
      +    '<button type="submit" tabindex="1" name="sbutton" id="sbutton" class="goog-btn '+ (gvar.user.isDonatur ? 'goog-btn-primary' : 'goog-btn-red') +(gvar.readonly ? ' goog-btn-disabled':'')+'">'+(gvar.user.isDonatur ? '':'<i class="icon-rc2"></i>')+gvar.inner.reply.submit+'</button>'
      +    '<input type="submit" tabindex="2" value="Preview Post" name="spreview" id="spreview" class="goog-btn goog-btn-default'+(gvar.readonly ? ' goog-btn-disabled':'')+'"/>'
      +    '<input type="submit" tabindex="3" value="Go Advanced" name="sadvanced" id="sadvanced" class="goog-btn goog-btn-default'+(gvar.readonly ? ' goog-btn-disabled':'')+'"/>'
      +  '</div>' // .col
      +  '<div class="clearfix"></div>'
      + '</div>' // .form-group.fg-button-submit

      +  (gvar.__DEBUG__ ? '<div class="clearfix"></div><br/>' : '')
      +  '<input type="'+(gvar.__DEBUG__?'text':'hidden')+'" class="form-control" id="tmp_chkVal" placeholder="tmp_chkVal" style="margin-top:5px;" />'
      +  '<input type="'+(gvar.__DEBUG__?'text':'hidden')+'" class="form-control" id="current_ckck" placeholder="current_ckck" style="margin-top:5px;" />'
      +  '<textarea class="form-control'+(gvar.__DEBUG__?'':' ghost')+'" id="ifr_content" placeholder="ifr_content" style="margin-top:5px;"></textarea>'

      + '<div class="clearfix"></div>'
      + '</form>'
      + '</div>' // #formqr
      + '</div>' // .reply-thread
      +'</div>' // #qID

      // -=-=-=eof-tpl

      // debug-text fontawesome
      // + '<div class="clearfix"><br/><br/></div>'
      // + '<div style="font-size:14px">'+rSRC.menuTestFoo()+'</div>'
    ;
  },

  getBOXDialog: function(){
    // preview BOX
    return ''
    +'<div id="modal_dialog_box" class="modal-dialog-main" style="display:none">'
    +'<div class="modal-dialog-title">'
    + '<span class="modal-dialog-title-text">Preview '+(gvar.edit_mode ? gvar.inner.edit.title : gvar.inner.reply.title)+'</span><span class="kqr-icon-close popbox"/>'
    + '<span class="icon-action" title="'+(gvar.edit_mode ? 'Edit':'Reply')+' Post"><i class="fa fa-'+(gvar.edit_mode?'edit':'comments')+'"></i></span>'
    +'</div>'
    
    +'<div id="box_wrap">'
    + '<div id="box_preview" class="entry-content">'
    +  '<div class="box_preloader"><img src="'+gvar.B.nocache_png+'" /></div>'
    + '</div>' // box_preview
    + '<div class="clearfix"></div>'
    +'</div>' // box_wrap
    
    +'<div id="cont_button" class="modal-dialog-buttons preview_bottom" style="display:none; width:400px">'
    + '<span class="qr_current_user"></span>'
    + '<button id="box_prepost" class="goog-btn goog-btn-md '+(gvar.user.isDonatur || gvar.is_solvedrobot ? 'goog-btn-primary':'goog-btn-red') +'">'+(gvar.edit_mode ? gvar.inner.edit.submit : 'Post')+'</button>'
    + '<button id="box_cancel" class="goog-btn goog-btn-md goog-btn-default">Cancel</button>'
    +'</div>'
    +'</div>' // modal_dialog_box
    +'';
  },

  getBOX_RCDialog: function(){
    // recaptcha BOX
    return ''
    // w/o .modal-dialog-main, so it just the content
    +'<div id="modal_capcay_box" class="capcay-dialog" style="display:none;">'
    +'<div class="modal-dialog-title"><span class="modal-dialog-title-text">'+(gvar.edit_mode ? 'Saving Changes':'Verification')+'</span><span class="kqr-icon-close popbox"/></div>'
    
    // helper fake-elements
    // remote Recaptcha handler dompage-wrapper com
    +'<input type="button" class="ghost" id="hidrecap_btn" value="reCAPTCHA" onclick="showRecaptcha2();" />' 
    +'<input type="button" class="ghost" id="resetrecap_btn" value="rRC" />' 

    +'<div id="box_wrap" class="ycapcay">'
    +(gvar.edit_mode ? ''
      : '<div><label for="recaptcha_response_field" style="width:100%!important; float:none!important;">'
        +(gvar.user.isDonatur ? 'Submit post...' : '&nbsp;')
        +'</label></div>'
     )
    + '<div id="box_response_msg" class="ghost"></div>'
    + '<div id="box_recaptcha_container" class="entry-content">'
        // activate-disabled | activated 
    +   '<div id="box_progress_posting" class="activate-disabled"></div>'

    // ghost RCw when box_progress_posting is .activated
    + (!gvar.user.isDonatur ? '<div class="RCw" id="recaptcha_widget">'+rSRC._BOX_RC_Widget()+'<i class="left-arrow"></i><span>Click to Post</span></div>' : '')
    + '</div>'
    + '<div id="cont_button" class="modal-dialog-buttons" '+(gvar.edit_mode ? ' style="visibility:hidden;"':'')+'>'
    +  '<span class="qr_current_user"></span>'
    +  '<button id="box_post" class="goog-btn goog-btn-md goog-btn-primary">Post</button>'
    + '</div>'
    
    +'</div>' // box_wrap
    +'</div>' // modal_capcay_box
    ;
  },
  _BOX_RC_Widget: function(){
    return ''
      +'<div id="kqr_recaptcha2"></div>'
    ;
  },
  _BOX_RC_Widget_OLD: function(){
    return ''
    +'<div id="recaptcha_image"><img height="57" src="'+gvar.B.nocache_png+'" /></div>'
    +'<div class="recaptcha-main">'
    +'<label style="width:100%!important">'
    + '<strong><span id="recaptcha_instructions_image">Please Insert ReCapcay:</span></strong>'
    + '<input type="text" name="recaptcha_response_field" id="recaptcha_response_field" autocomplete="off"/>'
    + '<input type="hidden" name="recaptcha_challenge_field" id="recaptcha_challenge_field" />'
    +'</label>'
    +'<div class="recaptcha-buttons">'
     +'<a title="Get a new challenge" href="javascript:Recaptcha.reload()" id="recaptcha_reload_btn"><span>Reload reCapcay</span></a>'
     +'<a title="Help" href="javascript:Recaptcha.showhelp()" id="recaptcha_whatsthis_btn"><span>Help</span></a>'
    +'</div>' // recaptcha-buttons
    +'</div>' //recaptcha-main
    ;
  },
  getTPLCustom: function(menus){
    return ''
    +'<div class="wraper_custom">'
    +'<div class="col-xs-2 cs_left">'
    + '<div id="dv_menu_disabler" class="hide" style="position:absolute; padding:0;margin:0;border:0; opacity:.15; filter:alpha(opacity=15); background:#000; width:100%; height:100%"></div>'
    + '<ul id="ul_group" class="qrset_mnu">'
    +   menus
    + '</ul>'
    +'</div>' // cs_left
    +'<div class="col-xs-10 cs_right sid_beloweditor">'
    +'<div role="form" class="form-manage">'
     +'<div id="custom_bottom" class="hide">'
      +'<div class="form-group relative">'
       +'<input type="hidden" id="current_grup" />'
       +'<input type="hidden" id="current_order" />'
       +'<span id="title_group"></span>'
       +'<a tabindex="502" href="javascript:;" id="manage_btn" class="goog-btn goog-btn-primary goog-btn-xs">Manage</a>'
       +'<a tabindex="503" href="javascript:;" id="manage_cancel" class="goog-btn goog-btn-default goog-btn-xs hide">Cancel</a>'
       +'<a tabindex="504" href="javascript:;" id="manage_help" class="goog-btn goog-btn-default goog-btn-xs pull-right hide" title="RTFM">[ ? ]</a>'
       +'<span id="position_group" class="hide"></span>'
      +'</div>' // .form-group
     +'</div>' // #custom_bottom
     +'<div id="custom_addgroup_container" class="hide">'
      +'<div id="manage_container">'
        +'<div class="form-group">'
         +'<label id="label_group" for="input_grupname">Group</label>'
         +'<input id="input_grupname" tabindex="500" class="twt-glow input_title" title="Group Name" style="width: 200px;"  />'
         +'<a id="delete_grupname" tabindex="506" href="javascript:;" class="goog-btn goog-btn-red goog-btn-xs" style="margin-left:20px;" title="Delete this Group">delete</a>'
        +'</div>' // .form-group
        +'<div class="form-group">'
         +'<textarea id="textarea_scustom_container" tabindex="501" class="twt-glow kqr-txta_editor"></textarea>'
        +'</div>' // .form-group
      +'</div>' // #manage_container
     +'</div>' // #custom_addgroup_container
    +'</div>' // role[form]

    +'<div id="scustom_container" role="form" class="form-thumb">'
     +'<div class="notfound">'
       +'<p>Custom Smiley Not Found, <a href="http://goo.gl/TGyZmR" target="_blank">what is this?</a></p>'
       +'<p>Browse to <a href="http://kask.us/gWtme" target="_blank">Emoticon Corner</a></p>'
     +'</div>'
    +'</div>' // #scustom_container

    +'</div>' // cs_right
    +'</div>' // wraper_custom
    ;
  },

  // -=-=-=-=-=-=-!!!!!!!
  getTPLUpload: function(menus){
    return ''
    +'<div class="wraper_custom relative">'
     +'<div class="col-xs-2 cs_left">'
     + '<ul id="ul_group" class="qrset_mnu">'
     +   menus
     +  '<li><div class="spacer" /></li>' // end list
     + '</ul>'
     +'</div>' // cs_left
     +'<div class="col-xs-10 cs_right sid_beloweditor" style="padding:0 10px;">'
     + '<div id="uploader_container"></div>'
     +'</div>' // cs_right
     +'<span id="toggle-sideuploader" class="goog-btn goog-btn-default goog-btn-xs goog-btn-flat toggle-sidebar" data-state="hide">&#9664;</span>'
     +'<div class="clearfix"></div>'
    +'</div>' // wraper_custom
    ;
  },


  _TPLSettingGeneral: function(){
    var GVS = gvar.settings,
        nb = '&nbsp;',
        hk = String(gvar.settings.hotkeykey).split(','),
        cUL = String(gvar.settings.userLayout.config).split(','),
        cls_label = 'col-sm-4 control-label',
        cls_cont = 'col-sm-8',
        GVS_aus = GVS.autoload_smiley,
        GVS_auc = GVS.autocomplete_smiley,
        GVS_ftab = GVS.tabfirst_smiley,
        gen_helplink = function(hash, title){
          var url = 'https://greasyfork.org/en/forum/discussion/3164/kaskus-quick-reply-features-how-to#'+hash;
          return '<a href="'+url+'" title="'+(title ? title : '')+'" target="_blank"><i class="stage stage-help"></i></a>';
        }
    ;
    clog(GVS_ftab);

    return ''
    +'<div role="form" class="form-horizontal">'
    +'<div class="form-group fg-tabify">'
     +'<div class="goog-tab-bar goog-tab-white">'
      +'<div id="tstg-general" data-target="tabs-itemstg-general" class="goog-tab goog-tab-selected">General</div>'
      +'<div id="tstg-smilies" data-target="tabs-itemstg-smilies" class="goog-tab">Smilies</div>'
      +'<div class="clearfix"></div>'
     +'</div>'
     +'<div class="goog-tab-bar-clear"></div>'
     +'<div class="goog-tab-content goog-tab-white">'
      +'<div id="tabs-contentstg-inner">'
      +'<div id="tabs-itemstg-general" class="itemtabcon active">'

       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_updates" title="Check for latest QR Update">Enable Update Checker'+gen_helplink("checkupdate")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input type="checkbox" id="misc_updates" class="optchk" '+(GVS.updates ? ' checked="checked"':'')+'/>'
       +   ( !gvar.noCrossDomain ? nb+nb+'<a id="chk_upd_now" class="goog-btn goog-btn-primary goog-btn-xs pull-right btn_check_upd" href="javascript:;" title="Check Update Now">check now</a><span id="chk_upd_load" class="uloader" style="display:none">checking...</span>' : '')
       +  '</div>'
       +  '<div id="misc_updates_child" class="fg-sub'+(GVS.updates ? '':' hide')+'" title="Interval check update, 0 &lt; interval &lt;= 99">'
       +   '<input id="misc_updates_interval" class="twt-glow" value="'+ GVS.updates_interval +'" maxlength="5" type="text" /> day interval'
       +  '</div>' // fg-sub
       + '</div>' // cls_cont
       +'</div>' // fg
  
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_hotkey">Enable QR-Hotkey'+gen_helplink("qrhotkey")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input type="checkbox" id="misc_hotkey" class="optchk" '+(String(GVS.hotkeykey)!='0,0,0' ? ' checked="checked"' : '')+'/> <em class="checkbox-text checkbox-desc">(require reload page)</em>'
       +  '</div>'
       +  '<div id="misc_hotkey_child" class="fg-sub fg-hotkey'+(String(GVS.hotkeykey)!='0,0,0' ? '':' hide')+'">'
       +   '<div class="checkbox">'
       +    '<label><input id="misc_hotkey_ctrl"'+ (hk[0]=='1' ? ' checked="checked"':'') +' type="checkbox" /> Ctrl</label>'
       +    '<label><input id="misc_hotkey_shift"'+ (hk[1]=='1' ? ' checked="checked"':'') +' type="checkbox" /> Shift</label>'
       +    '<label><input id="misc_hotkey_alt"'+ (hk[2]=='1' ? ' checked="checked"':'') +' type="checkbox" /> Alt</label>'
       +    '<label><input title="alphnumeric [A-Z0-9]; blank=disable" id="misc_hotkey_char" value="'+ GVS.hotkeychar +'" class="twt-glow" style="width: 40px;" maxlength="1" type="text" /></label>'
       +   '</div>'
       +  '</div>' // fg-sub
       + '</div>' // cls_cont
       +'</div>' // fg
  
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_txtcount">Enable Text Counter'+gen_helplink("textcounter")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_txtcount" class="optchk" type="checkbox" '+(GVS.txtcount ? ' checked="checked"' : '')+'/>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
  
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_elastic_editor" title="Keep editor on elastic mode">Elastic Editor'+gen_helplink("elasticeditor")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_elastic_editor" class="optchk" type="checkbox" '+(GVS.elastic_editor ? 'checked="checked"':'')+'/>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
       +'<div class="form-group fg-fixed_toolbar'+(GVS.elastic_editor ? '' : ' hide')+'">'
       + '<label class="'+cls_label+'" for="misc_fixed_toolbar">Fixed BBCode Toolbar'+gen_helplink("fixedtoolbar")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_fixed_toolbar" class="optchk" type="checkbox" '+(GVS.fixed_toolbar ? 'checked="checked"':'')+'/>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
    
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_theme_fixups" title="Theme Fixup CSS, killing in the sidebar off">Theme Fixups'+gen_helplink("themefixups")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<select id="misc_theme_fixups" class="form-control">'
       +   '<option> - Select One - </option>'
       +   '<option '+(GVS.theme_fixups == 'centered' ? ' selected="selected"':'')+' value="centered">Centered</option>'
       +   '<option '+(GVS.theme_fixups == 'c1024px' ? ' selected="selected"':'')+' value="c1024px">Centered 1024px</option>'
       +   '<option '+(GVS.theme_fixups == 'fullwidth' ? ' selected="selected"':'')+' value="fullwidth">Full Width</option>'
       +  '</select>'
       + '</div>' // cls_cont
       +'</div>' // fg

       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_hide_greylink">Hide Grey Origin Link'+gen_helplink("hidegreylink")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_hide_greylink" class="optchk" type="checkbox" '+(GVS.hide_greylink ? ' checked="checked"' : '')+'/>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
  
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_always_notify">Notifying Quoted Post'+gen_helplink("always-notify")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_always_notify" class="optchk" type="checkbox" '+(GVS.always_notify ? ' checked="checked"' : '')+'/>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
  
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_autolayout">Enable AutoLayout'+gen_helplink("autolayout")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_autolayout" class="optchk" type="checkbox" '+(cUL[1]=='1' ? ' checked="checked"':'')+'/>'
       +   '<a id="edit_tpl_cancel" href="javascript:;" class="goog-btn goog-btn-default goog-btn-xs cancel_layout" style="display:'+ (cUL[1]=='1' ? '' : 'none') +';"> cancel </a>'
       +  '</div>'
       +  '<div id="misc_autolayout_child" class="fg-sub'+(cUL[1]=='1' ? '':' hide')+'">'
       +   '<textarea class="twt-glow kqr-txta_editor" id="edit_tpl_txta">'+gvar.settings.userLayout.template+'</textarea>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
      +'</div>' // .itemtabcon




      +'<div id="tabs-itemstg-smilies" class="itemtabcon">'
       // -=-=-=-=-=-=-=-
       // +recent-smilies
       // -=-=-=-=-=-=-=-

       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_smiley_kplus">KaskusPlus Exclusive'+gen_helplink("kaskusplus")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_smiley_kplus" class="optchk" type="checkbox" '+(GVS.show_kaskusplus ? ' checked="checked"' : '')+'/>  <em class="checkbox-text checkbox-desc">(require reload page)</em>'
       +  '</div>'
       +  '<div id="misc_smiley_kplus_child" class="fg-sub'+(GVS.show_kaskusplus ? '':' hide')+'">'
       +  '<label><input id="misc_smiley_kplus_bbcode_img" class="optchk" type="checkbox" '+(GVS.kaskusplus_bbcode_img ? ' checked="checked"' : '')+'/> Use [IMG][/IMG] BBCODE</label>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg

       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_smiley_autocomplete">Auto Complete (<a href="https://github.com/ichord/At.js/tree/gh-pages" target="_blank">At.js</a>)'+gen_helplink("autocomplete")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_smiley_autocomplete" class="optchk" type="checkbox" '+(GVS_auc[0]=='1' ? ' checked="checked"' : '')+'/> <em class="checkbox-text checkbox-desc">(require reload page)</em>'
       +  '</div>'
       +  '<div id="misc_smiley_autocomplete_child" class="fg-sub'+(GVS_auc[0]=='1' ? '':' hide')+'">'
       +   '<div class="checkbox">'
       +    '<label><input name="auc" type="checkbox" value="kecil" '+( GVS_auc[1].indexOf('kecil') !== -1 ? 'checked':'')+'/> Kecil</label>'
       +    '<label><input name="auc" type="checkbox" value="besar" '+( GVS_auc[1].indexOf('besar') !== -1 ? 'checked':'')+'/> Besar</label>'
       +    '<label class="kplus_first'+(GVS.show_kaskusplus ? '':' hide')+'"><input name="auc" type="checkbox" value="kplus" '+(GVS_auc[1].indexOf('kplus') !== -1 ? 'checked':'')+'/> KPlus</label>'
       +   '</div>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg

       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_autoshow_smile">Auto Show'+gen_helplink("autoshowsmiley")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_autoshow_smile" class="optchk" type="checkbox" '+(GVS_aus[0]=='1' ? 'checked="checked"':'')+'/>'
       +  '</div>'
       +  '<div id="misc_autoshow_smile_child" class="fg-sub'+(GVS_aus[0]=='1' ? '':' hide')+'">'
       +   '<div class="radio">'
       +    '<label><input name="aus" type="radio" value="kecil" '+(GVS_aus[1]=='kecil' ? 'checked':'')+'/> Kecil</label>'
       +    '<label><input name="aus" type="radio" value="besar" '+(GVS_aus[1]=='besar' ? 'checked':'')+'/> Besar</label>'
       +    '<label class="kplus_first'+(GVS.show_kaskusplus ? '':' hide')+'"><input name="aus" type="radio" value="kplus" '+(GVS_aus[1]=='kplus' ? 'checked':'')+'/> KPlus</label>'
       +    '<label><input name="aus" type="radio" value="custom" '+(GVS_aus[1]=='custom' ? 'checked':'')+'/> Custom</label>'
       +   '</div>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg

       +'<div class="form-group">'
       + '<label class="'+cls_label+'">First Tab'+gen_helplink("tabfirst")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="fg-sub">'
       +   '<div class="radio">'
       +    '<label><input name="ftab" type="radio" value="kecil" '+(GVS_ftab=='kecil' ? 'checked':'')+'/> Kecil</label>'
       +    '<label><input name="ftab" type="radio" value="besar" '+(GVS_ftab=='besar' ? 'checked':'')+'/> Besar</label>'
       +    '<label class="kplus_first'+(GVS.show_kaskusplus ? '':' hide')+'"><input name="ftab" type="radio" value="kplus" '+(GVS_ftab=='kplus' ? 'checked':'')+'/> KPlus</label>'
       +    '<label><input name="ftab" type="radio" value="custom" '+(GVS_ftab=='custom' ? 'checked':'')+'/> Custom</label>'
       +   '</div>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg
  
       +'<div class="form-group">'
       + '<label class="'+cls_label+'" for="misc_scustom_noparse" title="Custom Smiley BBCode will not be rendered">Noparse Custom BBCode'+gen_helplink("noparsecustom")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox">'
       +   '<input id="misc_scustom_noparse" class="optchk" type="checkbox" '+(GVS.scustom_noparse ? ' checked="checked"' : '')+'/>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg

       +'<div class="form-group">'
       + '<label class="'+cls_label+'">Update Kaskus Smilies'+gen_helplink("update-kaskus-smilies")+'</label>'
       + '<div class="'+cls_cont+'">'
       +  '<div class="checkbox last-update-smilies">'
       +   (gvar.smiley_bulk && gvar.smiley_bulk.counts ? gvar.smiley_bulk.counts : 0)+' smilies, '
       +   'updated: '+(gvar.smiley_bulk && gvar.smiley_bulk.lastupdate ? gvar.smiley_bulk.lastupdate : 'n/a')
       +  '</div>'
       +  '<div class="checkbox" style="padding-top:0; min-height:auto;">'
       +   '<a id="chk_upd_smilies" class="goog-btn goog-btn-default goog-btn-xs btn_upd_smilies" href="javascript:;" title="Update Kaskus Smilies" data-deftext="Update Smilies">Update Smilies</a>'
       +  '</div>'
       + '</div>' // cls_cont
       +'</div>' // fg


      +'</div>' // .itemtabcon
    +'</div>' // role[form]
    ;
  },
  _TPLSettingExim: function(){
    return ''
    +'<div role="form" class="form-horizontal">'
     +'<div class="form-group fg-exim">'
     +'<p>To export your settings, copy the text below and save it in a file.</p>'
     +'<p>To import your settings later, overwrite the text below with the text you saved previously and click "<b>Import</b>".</p>'
     +'<textarea id="textarea_rawdata" class="twt-glow kqr-txta_editor textarea_rawdata" readonly="readonly"></textarea>'
     +'</div>' // fg
     +'<div class="form-group fg-exim">'
     +'<a id="exim_select_all" class="goog-btn goog-btn-default goog-btn-xs" href="javascript:;">Select All</a>'
     +'</div>' // fg
    +'</div>' // role[form]
    ;
  },
  _TPLSettingShortcut: function(){
    var arr = {
      right: HtmlUnicodeDecode('&#9654;'), left: HtmlUnicodeDecode('&#9664;')
    };
    return ''
    +'<div role="form" class="form-horizontal">'
    +'<div class="form-group fg-tabify fg-kbd">'
    +'<div class="goog-tab-bar goog-tab-white">'
     +'<div id="tkbd-qr" data-target="tabs-itemkbd-qr" class="goog-tab goog-tab-selected">KQR Hotkeys</div>'
     +'<div id="tkbd-kaskus" data-target="tabs-itemkbd-kaskus" class="goog-tab">Kaskus Hotkeys <a target="_blank" href="http://help.kaskus.co.id/kaskus-basic/kaskus_hotkeys.html" style="float:right; margin:0 4px; line-height: 13px;" title="Kaskus Hotkeys, Goto Help Center.."><i class="fa fa-question-circle"></i></a></div>'
     +'<div class="clearfix"></div>'
    +'</div>'
    +'<div class="goog-tab-bar-clear"></div>'
    +'<div class="goog-tab-content goog-tab-white">'
      +'<div id="tabs-contentkbd-inner">'
      +'<div id="tabs-itemkbd-qr" class="itemtabcon active">'
       +'<em>Global on thread page</em>'
       +'<p><tt><kbd>Esc</kbd></tt><span>Close Active Popup</span></p>'
       +'<p><tt><kbd>Ctrl</kbd> + <kbd>Q</kbd></tt><span>Focus to QR Editor</span></p>'
       +'<p><tt><kbd>Alt</kbd> + <kbd>Q</kbd></tt><span>Fetch Selected Post</span></p>'
       +'<p><tt><kbd>Alt</kbd> + <kbd>C</kbd></tt><span>Quick Quote Selected Post</span></p>'
       +'<p><tt><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>Q</kbd></tt><span>Deselect All Quoted Post</span></p>'
       +'<p><tt><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd></tt><span>Load/Save Draft</span></p>'
       +'<em>While focus on Editor / textarea</em>'
       +'<p><tt><kbd>Ctrl</kbd> + <kbd>Enter</kbd></tt><span>Post Reply</span></p>'
       +'<p><tt><kbd>Alt</kbd> + <kbd>S</kbd></tt><span>Post Reply</span></p>'
       +'<p><tt><kbd>Alt</kbd> + <kbd>P</kbd></tt><span>Preview Quick Reply</span></p>'
       +'<p><tt><kbd>Alt</kbd> + <kbd>X</kbd></tt><span>Go Advanced</span></p>'
      +'</div>' // itemkbd
      +'<div id="tabs-itemkbd-kaskus" class="itemtabcon">'
       +'<p><tt><kbd>J</kbd></tt><span>Jump to next post section</span></p>'
       +'<p><tt><kbd>K</kbd></tt><span>Jump to previous post section</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>X</kbd></tt><span>Open all spoiler</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>A</kbd></tt><span>Show/Hide All categories</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>S</kbd></tt><span>Search</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>1</kbd></tt><span>Go to Homepage</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>2</kbd></tt><span>Go to Forum landing page</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>3</kbd></tt><span>Go to Jual Beli landing page</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>4</kbd></tt><span>Go to Groupee landing page</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>R</kbd></tt><span>Reply Thread</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>'+arr['left']+'</kbd></tt><span>Go to previous page</span></p>'
       +'<p><tt><kbd>Shift</kbd> + <kbd>'+arr['right']+'</kbd></tt><span>Go to next page</span></p>'
       +'<p><tt><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>'+arr['left']+'</kbd></tt><span>Go to previous thread</span></p>'
       +'<p><tt><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>'+arr['right']+'</kbd></tt><span>Go to next thread</span></p>'
      +'</div>'
      +'</div>' // #tabs-contentkbd-inner
    +'</div>' // tab-content
    +'</div>' // fg-kbd
    +'</div>' // role[form]
    ;
  },
  _TPLSettingAbout: function(){
    var nb = "&nbsp;"
      ksk = gvar.domain.replace(/^[^\.]+.|\//gi,''),
      _sp = '<div class="spacer"></div>';
    return ''
    +'<div role="form" class="form-horizontal">'
     +'<div class="form-group fg-tabify fg-about">'
     +'<div class="goog-tab-bar goog-tab-white">'
      +'<div id="tabt-about" data-target="tabs-itemabt-about" class="goog-tab goog-tab-selected">About</div>'
      +'<div id="tabt-contr" data-target="tabs-itemabt-contr" class="goog-tab">Contributor</div>'
      +'<div class="clearfix"></div>'
     +'</div>'
     +'<div class="goog-tab-bar-clear"></div>'
     +'<div class="goog-tab-content goog-tab-white">'
      +'<div id="tabs-contentabt-inner">'
      +'<div id="tabs-itemabt-about" class="itemtabcon active">'
       +'<h3 class="brand">'
        +'<a href="'+'https://greasyfork.org/scripts/'+gvar.scriptMeta.scriptID_GF+'" class="brandlink" target="_blank">'+ gvar.scriptMeta.fullname +'</a> &#8212; '+ gvar.sversion +' &middot; <em>'+gvar.scriptMeta.dtversion+'</em>'
        +'<a href="https://github.com/idoenk/kaskus-quick-reply" target="_blank" class="repolink pull-right"><img src="https://dl.dropboxusercontent.com/s/alzoyd0s4r2ekrd/github-64-min.png" title="Kaskus Quick Reply on GitHub" height="33"></a>'
       +'</h3>'
       +'<p><a href="http://creativecommons.org/licenses/by-nc-sa/3.0" target="_blank"><img src="http://i.creativecommons.org/l/by-nc-sa/3.0/88x31.png" /></a> <span class="cpr">&copy;</span> 2010-15 Idx. '
       +'Licensed under a Creative Commons&nbsp;<a href="http://creativecommons.org/licenses/by-nc-sa/3.0" target="_blank">NC-SA 3.0 License</a></p>'
       +_sp
       +'<p>KASKUS brand is a registered trademark of '+ksk+'</p>'
       +'<p>'+gvar.scriptMeta.fullname + ' (KQR) is not related to or endorsed by '+ksk+' in any way</p>'
       +_sp
       +'<p><strong>Threads</strong></p>'
       +'<p><ul class="rel-thread">'
        +'<li><a href="'+ gvar.kask_domain +'hCZmM" target="_blank" title="All About Mozilla Firefox (Add-ons, Scripts, Fans Club)">Firefox</a> <a href="/profile/809411" target="_blank" title="TS: p1nk3d_books">*</a></li>'
        +'<li><a href="'+ gvar.kask_domain +'6595796" target="_blank" title="[Rebuild] Opera Community">Opera</a> <a href="/profile/786407" target="_blank" title="TS: ceroberoz"> * </a></li>'
        +'<li><a href="'+ gvar.kask_domain +'3319338" target="_blank" title="[Updated] Extensions/ Addons Google Chrome">Google-Chrome</a> <a href="/profile/449547" target="_blank" title="TS: Aerialsky"> * </a></li>'
        +'<li class="spacer">&nbsp;</li>'
        +'<li><a href="'+ gvar.kask_domain +'6616714" target="_blank" title="Add-ons Kaskus Quick Reply + [QR]">Quick Reply+</a> <a href="/profile/1323912" target="_blank" title="TS: Piluze"> * </a></li>'
        +'<li><a href="'+ gvar.kask_domain +'6849735" target="_blank" title="Emoticon Corner">Emoticon Corner</a> <a href="/profile/572275" target="_blank" title="TS: slifer2006"> * </a><br></li>'
       +'</ul></p>'
       +_sp
       +'<p class="malu">Having problems, complaints, questions or just compliments? Just drop me an email :) <a onclick="return kqrmailto(this)" href="mailto:&#097;&#118;&#114;&#105;&#108;&#099;&#111;&#100;&#101;&#064;&#103;&#109;&#097;&#105;&#108;&#046;&#099;&#111;&#109">&#097;&#118;&#114;&#105;&#108;&#099;&#111;&#100;&#101;&#064;&#103;&#109;&#097;&#105;&#108;&#046;&#099;&#111;&#109;</a></p>'
      +'</div>' // itemabt

      +'<div id="tabs-itemabt-contr" class="itemtabcon">'
       +'<div class="st_contributor">'
       +'<p><b>Thanks</b></p>'
       +'<div class="contr_l col-xs-6">'
       +'Piluze<br>S4nJi<br>riza_kasela<br>p1nk3d_books<br>b3g0<br>fazar<br>bagosbanget<br>eric.<br>bedjho<br>Piluze<br>intruder.master<br>'
       +'Rh354<br>drupalorg<br>'
       +'</div>'
       +'<div class="contr_r col-xs-6">'
       +'gr0<br>hermawan64<br>slifer2006<br>gzt<br>Duljondul<br>reongkacun<br>otnaibef<br>ketang8keting<br>farin<br>'
       +'.Shana<br>t0g3<br>&amp;all-kaskuser@<a href="'+ gvar.kask_domain + '3170414" target="_blank">t=3170414</a>'
       +'</div>'
       +'<div class="clearfix"></div>'
       +_sp
       +'<p><b>Snippet codes</b></p>'
       +'<p>(ApiBrowserCheck) - YouTube Enhancer by GIJoe; YouTube Center by YePpHa</p>'
       +_sp
       +'<p><b>Shout pasukan-cumik</b></p>'
       +'<p>kakilangit, judotens, matriphe, mursid88, robee_, cheanizer</p>'
       +_sp
       +'</div>'
      +'</div>' // itemabt
      +'</div>' // #tabs-contentabt-inner
      +'<div class="clearfix"></div>'
     +'</div>' // tab-content
     +'</div>' // fg
    +'</div>' // role[form]
    ;
  },
  getTPLSettingDialog: function(){
    // setting BOX
    return ''
    +'<div id="modal_setting_box" class="modal-dialog-main msb static_width" style="display:none;">'
    +'<div class="modal-dialog-title"><span class="modal-dialog-title-text">Settings<span id="box_preview_subtitle"></span></span><span class="kqr-icon-close popbox"/></div>'
    
    +'<div id="box_wrap">'
     +'<div id="qr-box_setting" class="container entry-content">'
     +'<div class="row wraper_custom">'
      +'<div class="col-xs-2 sb_menu cs_left"></div>'
      +'<div class="col-xs-10 cs_right hide"></div>'
     +'</div>' // .row
     +'</div>' // .container
    +'</div>' // box_wrap

    +'<div id="cont_button" class="modal-dialog-buttons">'
    // + '<label class="codebuild pull-left">&mdash;KQR.Dev</label>'
    + '<label class="codebuild pull-left">&mdash;KQR</label>'
    + '<button id="box_action" data-act="update" class="goog-btn goog-btn-primary">Save</button>'
    + '<button id="box_cancel" class="goog-btn goog-btn-default">Close</button>'
    + '<a id="reset_settings" class="goog-btn goog-btn-flat pull-right btn-reset-setting">reset settings</a>'
    +'</div>'
    +'</div>' // modal_dialog_box
    +''
    ;
  },


  getTPLUpdateDialog: function(){
    // update BOX
    return ''
    +'<div id="modal_update_box" class="modal-dialog-main static_width" style="display:none;">'
    +'<div class="modal-dialog-title">'
    +'<span class="modal-dialog-title-text">'
    +'<img id="nfo_version" src="'+gvar.B.news_png+'" class="qbutton" style="float:left; margin:3px 5px 0 0;padding:3px;"/>'
    +'Update Notification</span><span class="kqr-icon-close popbox"/></div>'
    
    +'<div id="box_wrap">'
    + '<h3 id="box_update_title"></h3>'
    + '<div class="entry-content wraper_custom">'
    + '<div id="content_update"></div>'
    + '<div class="spacer"></div>'
    +'</div>' // box_wrap
    +'<div id="cont_button" class="modal-dialog-buttons">'
    + '<a id="box_update" href="https://greasyfork.org/scripts/gvar.scriptMeta.scriptID_GF" class="goog-btn goog-btn-xs goog-btn-primary hide">Visit</a>&nbsp;'
    + '<button id="box_cancel" class="goog-btn goog-btn-xs goog-btn-default">Close</button>'
    + '<div class="clearfix"><br/></div>'
    +'</div>'
    +'</div>' // modal_dialog_box
    +''
    ;
  },


  /* base of calling dialog. Name of dialog-tpl to call w/o "get" */
  getDialog: function(dialogname){
    if( "string" == typeof dialogname && dialogname )
      dialogname = "get"+dialogname;

    if( dialogname && "function" == typeof rSRC[dialogname] )
      return '<div class="kqr-dialog-base">'+rSRC[dialogname]()+'</div>';
  },

  getAlert: function(dialog_id, doshow, text){
    return ''
      +'<div id="'+dialog_id+'" style="position:fixed;z-index:99991;top:38px;left:45%; filter:alpha(opacity=90); opacity:.90;background:#f9edbe; border:1px solid #f0c36d; border-radius:2px;-moz-border-radius:2px;-webkit-border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,0.2);font-size:90%;font-weight:bold;line-height:22px;padding:0 15px;display:'+(doshow ? '':'none')+';">'
      +'<span class="qrV">QR: <span class="tXt">'+(text ? text : 'Loading...')+'</span></span>'
      +'<span class="close" style="display:inline-block;float:right;padding:auto 6px;cursor:pointer;margin:0 -5px 0 10px; color:#999;">&times;</span>'
      +'</div>'
    ;
  },


  getCSS: function(){
    return ""
    +'#box_preview {max-height:' + (parseInt( getHeight() ) - gvar.offsetMaxHeight - gvar.offsetLayer) + 'px;}'
    +'.ghost{ display:none; }'

    // atwho
    +'.atwho-container .atwho-view{opacity: .945;}'
  },
  getCSS_Fixups: function(mode){
    var css='', i='!important';
    var sb_kil = '#main .sidebar{display:none'+i+'}';
    var sgpost_sel = (gvar.thread_type == 'singlepost' ? ',.container > section':'');
    
    switch(mode){
      case "fullwidth":
        css+= ''
          +'.main-content,.user-control-stick{width:100%}'
          +'.user-control-stick{width:1170px}'
        ;
      break;
      case "c1024px":
        css+= ''
          +'.main-content,.main-content-full'+sgpost_sel+'{float:none'+i+';margin:auto}'
          +'.main-content,.main-content-full,.user-control-stick'+sgpost_sel+'{width:1024px}'
        ;
      break;
      case "centered": // kaskus.default
        css+= ''
          +'.main-content,.main-content-full'+sgpost_sel+'{float:none'+i+';margin:auto}'
          +'.main-content-full'+sgpost_sel+'{width:860px}'
        ;
      break;
      default:
        css='';
      break;
    }

    return (css ? sb_kil:'')+css;
  },


  getSCRIPT: function(){
    return ''
    +'var $ = $||jQuery.noConflict();'
    +'var prfx = "";'

    +'function showRecaptcha2(){'
    + 'if("undefined" !== typeof grecaptcha)'
    +  'grecaptcha.render("kqr_recaptcha2", {'
    +    '"sitekey": "6LdPZPoSAAAAANzOixEawpyggAQ6qtzIUNRTxJXZ",'
    +    '"callback": function(){$("#box_post").trigger("click") },'
    +    '"expired-callback": function(){ $("#box_prepost, #sbutton").removeClass("goog-btn-primary").addClass("goog-btn-red"); $("#resetrecap_btn").trigger("click") }'
    +  '});'
    + 'else{'
    +  'if(window.kqr_recaptcha2_injected) return;'
    +  '(function(d, s, k) {'
    +  'var js, hjs = d.getElementsByTagName(s)[0];'
    +  'if (d.getElementById(k)) return;'
    +  'js = d.createElement(s); js.id=k; js.async="async"; js.defer="defer";'
    +  'js.src = "https://www.google.com/recaptcha/api.js?hl=en&onload=showRecaptcha2&render=explicit";'
    +  'hjs.parentNode.insertBefore(js, hjs);'
    +  '})(document,"script","kqr_recaptcha2_inject");'
    +  'window.kqr_recaptcha2_injected=true;'
    + '}'
    +'}'
    +'function SimulateMouse(elem,event,preventDef) {'
    +  'if("object" != typeof elem) return;'
    +  'var evObj = document.createEvent("MouseEvents");'
    +  'preventDef = ("undefined" != typeof preventDef && preventDef ? true : false);'
    +  'evObj.initEvent(event, preventDef, true);'
    +  'try{ elem.dispatchEvent(evObj) }'
    +  'catch(e){ console && console.log && console.log("Error. elem.dispatchEvent is not function."+e) }'
    +'}'
    // jQuery.cookie handler
    +'function jq_cookie(){jQuery.cookie=function(d,e,b){if(arguments.length>1&&(e===null||typeof e!=="object")){b=jQuery.extend({},b);if(e===null){b.expires=-1}if(typeof b.expires==="number"){var g=b.expires,c=b.expires=new Date();c.setDate(c.getDate()+g)}return(document.cookie=[encodeURIComponent(d),"=",b.raw?String(e):encodeURIComponent(String(e)),b.expires?"; expires="+b.expires.toUTCString():"",b.path?"; path="+b.path:"",b.domain?"; domain="+b.domain:"",b.secure?"; secure":""].join(""))}b=e||{};var a,f=b.raw?function(h){return h}:decodeURIComponent;return(a=new RegExp("(?:^|; )"+encodeURIComponent(d)+"=([^;]*)").exec(document.cookie))?f(a[1]):null};$=jQuery}'

    +'var __mq="kaskus_multiquote", __tmp="tmp_chkVal";'
    +'function deleteMultiQuote(){!$[prfx+"cookie"] && jq_cookie(); $[prfx+"cookie"](__mq,null, { expires: null, path: "/", secure: false }); $("#"+__tmp).val("")}'
    +'function chkMultiQuote(){ !($ && $[prfx+"cookie"]) && jq_cookie(); var mqs=$[prfx+"cookie"](__mq)||""; $("#"+__tmp).val(mqs ? mqs.replace(/\s/g,"") : ""); SimulateMouse($("#qr_chkval").get(0), "click", true); }'
    +'try{chkMultiQuote()}catch(e){console && console.log && console.log(e)};'
    +'function injectMultiQuote(){!($ && $[prfx+"cookie"]) && jq_cookie(); var store_id=$("#"+__tmp).val(); if(store_id) $[prfx+"cookie"](__mq, store_id, {expired:null,path:"/",secure:false})};'


    +'function ifrdone(el, cb_elclick){'
    + 'var $frmcontent = $(el).contents();'
    + '$("#ifr_content").val( $frmcontent.find("textarea[name=message]").first().val() );'
    + 'if(cb_elclick == "#qr_signsectok"){'
    +   'var newsectok = $frmcontent.find("*[name=securitytoken]").val();'
    +   'newsectok && $("#qr-securitytoken").val(newsectok);'
    + '}'
    + '$(el).remove(); SimulateMouse( $(cb_elclick).get(0), "click", true);'
    +'}'

    +'function kqrmailto(el){'
    +'var pwin, p_url = el.getAttribute("href")+"?subject="+encodeURIComponent("#KQR: suggestion, bugs")+"&body=%0A%0A"+encodeURIComponent("UAString: "+window.navigator.userAgent)+"%0A"+encodeURIComponent("Via: QR-'+gvar.sversion+'");'
    +'var c = screen.height,d = screen.width,e = 0;'
    +'360 < c && (e = Math.round(c / 2 - 200));'
    +'c = ["scrollbars=yes,resizable=yes,toolbar=no,location=yes,width=640,height=400", "left=" + Math.round(d / 2 - 300), "top=" + e].join();'
    +'pwin = window.open(p_url, "kqrmailto", c);'
    +'pwin.focus();'
    +'return !1;'
    +'}'
    ;
  },
  getSCRIPT_UPL: function(){
    return ''
    +'function ajaxFileUpload() {'
    +'var $parent = $("#content_uploader_kaskus");'
    +'var $throb = $parent.find(".throbber_wrp");'
    +'var $imgc = $parent.find(".image-control");'
    +'$throb.show(); $imgc.addClass("blured");'
    +'$.ajaxFileUpload ({'
    + 'url:"/misc/upload_image",'
    + 'secureuri:false,'
    + 'fileElementId:"browse",'
    + 'dataType: "json",'
    + 'success: function (data, status){'
    +   '$imgc.removeClass("blured"); $throb.hide();'
    +   'if(data.status == "ok"){'
    +     'var t=\'\';'
    +     't+=\'<div class="preview-image-unit">\';'
    +     't+=\'<img src="\'+data.url+\'" width="46" height="46" alt="[IMG]\'+data.url+\'[/IMG]" />\';'
    +     't+=\'<span title="remove" class="kqr-icon-close imgremover"/>\';'
    +     't+=\'</div>\';'
    +     '$parent.find(".preview-image-inner").prepend( t );'
    +     '$("form[name*=\'jUploadForm\']").remove(); $("iframe[name*=\'jUploadFrame\']").remove();'
    +   '}else{'
    +     'console.log(data.error);'
    +   '}'
    +   '},'
    + 'error: function (data, status, e){console.log(e)}'
    +'});'
    +'return false;'
    +'}' // ajaxFileUpload
    ;
  },

  getSCRIPT_AtWho: function(smilies_){
    var nn = "\n";
    return ''
      // +'function clog(x){console.log(x)}'

      +'function kqrInitAtWho() {' + nn
          // dependencies check
      +  'if( !$.fn.atwho || !$.fn.caret ){ '
      +   'console.log("initAtWho fail. Either caret or atwho is not loaded. ");'
      +   'return !1;'
      +  '}' + nn
      +  '$.fn.atwho.debug = !1;' + nn

      +  'var kPlusBBcodeIMG = '+(gvar.settings.kaskusplus_bbcode_img ? '1' : '!1')+';' + nn
      +  'var textarea_selector = "#'+gvar.tID+'";' + nn
      +  'var smilies_ = \''+JSON.stringify(smilies_)+'\';' + nn
      +  'var smilies = (smilies_ ? JSON.parse(smilies_) : []);' + nn
      +  'var kskemojis = $.map(smilies, function(item, i){' + nn
      +    'var set = {' + nn
      +      'fn: item[0],' + nn
      +      'bbcode: item[1],' + nn
      +      'name: (item[3] ? item[3] : item[2])' + nn
      +    '};' + nn
      +    'if( set.name.indexOf("[Ps]") !== -1 )' + nn
      +    ' set.bbcode = (!kPlusBBcodeIMG ? set.bbcode : "[IMG]"+item[0]+"[/IMG]");' + nn
      +    'return set;' + nn
      +  '});' + nn
      
      +  'var emoji_config = {' + nn
      +    'at: ":",' + nn
      +    'data: kskemojis,' + nn
      +    'displayTpl: "<li><img src=\'${fn}\' height=\'20\' width=\'20\' /> ${name}</li>",' + nn
      +    'insertTpl: "${bbcode}",' + nn
      +    'delay: 200' + nn
      +  '};' + nn
      
      // initiating
      +  'var $inputor = jQuery(textarea_selector).atwho(emoji_config);' + nn
      +  '$inputor.caret("pos", 47);' + nn
      +  '$inputor.atwho("run");' + nn
      +'}' // kqrInitAtWho
      +'setTimeout(function(){ kqrInitAtWho();}, 1234);'
    ;
  },

  getSetOf: function(type){
    switch(type){
      case "color" :
      return {
        "#000000": "Black",
        "#A0522D": "Sienna",
        "#556B2F": "DarkOliveGreen",
        "#006400": "DarkGreen",
        "#483D8B": "DarkSlateBlue",
        "#000080": "Navy",
        "#4B0082": "Indigo",
        "#2F4F4F": "DarkSlateGray",
        "#8B0000": "DarkRed",
        "#FF8C00": "DarkOrange",
        "#808000": "Olive",
        "#008000": "Green",
        "#008080": "Teal",
        "#0000FF": "Blue",
        "#708090": "SlateGray",
        "#696969": "DimGray",
        "#FF0000": "Red",
        "#F4A460": "SandyBrown",
        "#9ACD32": "YellowGreen",
        "#2E8B57": "SeaGreen",
        "#48D1CC": "MediumTurquoise",
        "#4169E1": "RoyalBlue",
        "#800080": "Purple",
        "#808080": "Gray",
        "#FF00FF": "Magenta",
        "#FFA500": "Orange",
        "#FFFF00": "Yellow",
        "#00FF00": "Lime",
        "#00FFFF": "Cyan",
        "#00BFFF": "DeepSkyBlue",
        "#9932CC": "DarkOrchid",
        "#C0C0C0": "Silver",
        "#FFC0CB": "Pink",
        "#F5DEB3": "Wheat",
        "#FFFACD": "LemonChiffon",
        "#98FB98": "PaleGreen",
        "#AFEEEE": "PaleTurquoise",
        "#ADD8E6": "LightBlue",
        "#DDA0DD": "Plum",
        "#FFFFFF": "White"
      };
      break;

      case "button" :
      return {
         nocache_png : "data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
        ,news_png : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAANCAIAAAD5fKMWAAAABnRSTlMAAAAAAABupgeRAAAArklEQVR42mNkYGBgYGBob29/9OgRA14gJyfHAlHHz88/bdo0/KqzsrJYHj16lF/auG/Hmvv37587dw6XUiMjIwYGBhY4X1FRUVFREb/xLMic9knLGRgYKvMiT158jKbOXF+WgYGBiYEUgGJ2ZV4kCarR7B207ubn52dhYGB4ev+yh4fHhw8fIKLvPn4XFUAxRYif8/79+wwMDIxHjhzZsmXLx48f8buBn5/fw8MDAOiiPC0scvhsAAAAAElFTkSuQmCC"
      };
      break;
      
      case "posticon" :
      return {
        None: null,
        Post: "posting.gif",
        Video: "video.png",
        Lightbulb: "lightbulb.png",
        Exclamation: "exclamation.png",
        Star: "star.png",
        Cool: "smile3.png",
        Smile: "smile5.png",
        Angry: "repost.png",
        Unhappy: "smile4.png",
        Talking: "smile2.png",
        Heart: "heart.png",
        Wink: "smile.png",
        "Thumbs down": "thumbsdown.png",
        "thumbs up": "thumbsup.png"
      };
      break;

      default: return false; break;
    }
  },
  getSmileyBulkInfo: function(cb){
    getValue(KS+'SMILIES_BULK', function(ret){
      var smilies = {}, counter=0;
      if( ret ){
        try{
          ret = JSON.parse( ret );
        }catch(e){}

        smilies = (ret.ksk_smiley ? ret.ksk_smiley : null);
        clog( smilies );
        if( smilies ){
          for(var smtype in smilies){

            gvar['sm'+smtype] = smilies[smtype];
            counter += smilies[smtype]['smilies'].length;
          }
        }

        gvar.smiley_bulk = {
          lastupdate: (ret.lastupdate ? getHumanDate(parseFloat(ret.lastupdate)) : null),
          counts: (counter ? counter : 0)
        };
        smilies = null;
      }

      if('function' == typeof cb)
        cb();
    });
  },
  getSmileySet: function(onlyCustom, cb){
    //Format will be valid like this:
    // 'keyname1|link1,keyname2|link2'
    //eg. 
    // ':yoyocici|http://foo'
    //var sample = 'lopeh|http://static.kaskus.us/images/smilies/sumbangan/001.gif,nangis|http://static.kaskus.us/images/smilies/sumbangan/06.gif';
    // gvar.smcustom it is an associated object of all custom smiley
    // gvar.smgroup it is all name of group of custom smiley
    gvar.smcustom = {};
    gvar.smgroup = [];
    getValue(KS+'CUSTOM_SMILEY',  function(buff){
      
      if( buff && isString(buff) && buff!='' ){
        var grup, ret, extractSmiley = function(partition){
          if(!partition) return false;
          var idx=1,sepr = ',',customs=[];
          var smileys = partition.split(sepr);
          if(isDefined(smileys[0]))
          for(var i in smileys){
            if(isString(smileys[i]) && smileys[i]!=''){
              var parts = smileys[i].split('|');
              //customs[idx.toString()] = (isDefined(parts[1]) ? [parts[1], parts[0], parts[0]] : smileys[i]);
              customs.push( (isDefined(parts[1]) ? [parts[1], parts[0], parts[0]] : smileys[i]) );
              idx++;
            }
          }
          return customs;
        };

        if(buff.indexOf('<!!>')==-1){ // old raw-data
          ret = extractSmiley(buff);
          if(ret){
            grup='untitled';
            gvar.smcustom[grup.toString()] = ret;      
            gvar.smgroup.push(grup);
          }
        }else{
          // spliter: ['<!>','<!!>']; 
          // '<!>' split each group; '<!!>' split group and raw-data
          var parts = buff.split('<!>'),part2;
          for(var i=0; i<parts.length; i++){
            part2=parts[i].split('<!!>');
            part2[0]=part2[0].replace(/\\!/g,'!');
            if(part2.length > 0){
              ret = extractSmiley(part2[1]);
              if(ret){
                gvar.smcustom[part2[0].toString()] = ret;
                gvar.smgroup.push(part2[0].toString());
              }
            }
          }  // end for
        }
      } // end is buff
      
      if( isDefined(onlyCustom) && onlyCustom )
        if( typeof cb == 'function' ) cb();
    });

    if( isDefined(onlyCustom) && onlyCustom )
      return;

    rSRC.getSmileyBulkInfo( cb );
  }
};
//=== rSRC



// rSRC.;

/*
* object urusan ajax (modal-boxed)
* method yg dihandle: preview, submit, presubmit
*/
var _BOX = {
  e: {
     dialogname: 'qr-modalBoxFaderLayer' // [modalBoxFaderLayer, modal_dialog]
    ,boxpreview: 'modal_dialog_box'
    ,boxcapcay: 'modal_capcay_box'
    ,lastbuff: ''
    ,boxaction: ''
    ,ishalted: false
    ,isdiff: false
  },
  init: function(e){
    if( trimStr( $('#'+gvar.tID).val() ).length < 5 ){
      gvar.$w.clearTimeout(gvar.sTryEvent);
      $('#'+gvar.tID).addClass('twt-glowerror');
      _BOX.e.ishalted = 1;
      alert('The message you have entered is too short. Please lengthen your message to at least 5 characters');
      gvar.sTryEvent = gvar.$w.setTimeout(function(){$('#'+gvar.tID).removeClass('twt-glowerror') }, 3000);
      $('#'+gvar.tID).focus(); return;
    }
    close_popup();
    $(e).blur();
    _BOX.e.ishalted = false;
    $('body').addClass('hideflow');
  },
  boxEvents: function(){
    $('#box_cancel, .modal-dialog-main .kqr-icon-close').click(function(){
      close_popup()
    });

    $('#box_preview').on("scroll", function(){
      var $me = $(this),
          $par = $me.closest(".modal-dialog-main"),
          $tgt = $par.find('.modal-dialog-title').first()
      ;
      if( $me.scrollTop() > 0 )
        !$tgt.hasClass('glowed') && $tgt.addClass('glowed');
      else
        $tgt.removeClass('glowed')
    });
  },
  buildQuery: function(topost){
    //,"emailupdate","folderid","rating", 
    var fields = ["securitytoken", "title", "message", "iconid", "parseurl",
      // "recaptcha_response_field", "recaptcha_challenge_field",
      "g-recaptcha-response",
      "discussionid", "groupid"
    ];
    var url, name, val, query='', arquery={};

    if( gvar.edit_mode == 1 )
      fields = $.merge(["reason","folderid","emailupdate","rating"], fields);
    
    if( gvar.classbody == 'fjb' && $('.ts_fjb-type', $('#formform')).is(':visible') )
      fields = $.merge(["prefixid","kondisi","harga","tagsearch","lokasi"], fields);
    
    // &preview=Preview+Post&parseurl=1&emailupdate=9999&folderid=0&rating=0
    $('#formform').find('*[name]').each(function(){
      var inside = ($.inArray($(this).attr('name'), fields) != -1);
      if( inside ){
        val = ( trimStr( $(this).val() ) );
        name = encodeURIComponent( $(this).attr('name') );
        
        if( name=="title" ){
          if( $('#form-title').parent().hasClass('condensed') )
            val = "";
          else{
            // autocut upto 85 only
            val = val.substring(0, 85);
          }
        }else if(name=="message"){
          val = wrap_layout_tpl( val.replace(/\r\n/g, '\n') );
          clog('val message=\n' +  val );
          
          val = ( val + "\n" );
          
          // avoid fail encoding for autotext custom-smiley
          val = val.replace(/(\&\#\d+\;)\)/g, '$1&#41;');
          val = _AJAX.scustom_parser( val );
          
          clog('encodedval message=\n' +  val );
        }
        if( val!="" ) arquery[name] = val;
      }
    });
    !arquery['harga'] && (arquery['harga'] = 1);
    !arquery['lokasi'] && (arquery['lokasi'] = 33); // N/A

    _BOX.e.isdiff = (_BOX.e.lastbuff != trimStr( $('#'+gvar.tID).val() ));
    _BOX.e.lastbuff = trimStr( $('#'+gvar.tID).val() );
    _BOX.e.boxaction = encodeURI( $('#formform').attr('action') );
    return arquery;
  },
  preview: function(){
    if(_BOX.e.ishalted) return;
    
    // init preview
    $('#'+_BOX.e.dialogname).show().css('visibility', 'visible');
    $('body').prepend( rSRC.getDialog("BOXDialog") );
    resize_popup_container();
    
    _BOX.boxEvents();
    
    // early load scustom, check matched custom tag pattern
    if( !gvar.settings.scustom_noparse && "undefined" == typeof gvar.smcustom && $('#'+gvar.tID).val().match(/\[\[([^\]]+)/gi) )
        rSRC.getSmileySet(true);
    
    myfadeIn( $('#'+_BOX.e.boxpreview), 130, function(){
      swapCol();

      var query = _BOX.buildQuery();
      
      query["preview"] = encodeURI('Preview' + (gvar.thread_type == 'group' ? '' : ' Post'));
      
      clog( 'boxaction=' + _BOX.e.boxaction ); clog( 'tosend='+ JSON.stringify(query) );
      if( gvar.sTryRequest ){
        clog('Other AJAX instance [sTryRequest] is currently running, killing him now.');
        clog(JSON.stringify(gvar.sTryRequest));
        gvar.sTryRequest.abort();
      }
      try{
        
        _BOX.e.boxaction = location.protocol+'//'+gvar.kaskus_domain+'/misc/preview_post_ajax';

        if( query!="" )
          gvar.sTryRequest = $.ajax({
            url: _BOX.e.boxaction,
            type: 'post',
            data: query,
            xhrFields: {
              withCredentials: true
            },
            dataType: 'json',
            success: function(data){
              var valid, parsed, mH, imgTitle, titleStr, msg, func;
              var $box_preview, $btn_prepost;

              // over-ride handler
              if( 'string' == typeof data )
                parsed = $.parseJSON(data);
              else
                parsed = data;
              mH = ( parseInt( getHeight() ) - gvar.offsetMaxHeight - gvar.offsetLayer );

              $box_preview = $('#box_preview');
              $btn_prepost = $('#box_prepost');
              $box_preview.css('max-height', mH + 'px');

              if( parsed && !parsed.error && parsed.message ){
                $box_preview.html( parsed.message );

                // render mls-img to its data-src
                $box_preview.find(".mls-img").each(function(){
                  var $img = $(this);
                  $img
                    .attr("src", $img.attr("data-src"))
                    .removeClass("mls-img")
                    .removeAttr("data-src")
                    .addClass("rjn-img")
                  ;
                });
                $('#cont_button').show();

                $btn_prepost.click(function(e){
                  _BOX.init(e);
                  _BOX.presubmit();
                });

                // wait for image being loaded, restore top position of dialog to 10px
                setTimeout(function(){
                  var $kdb = $(".kqr-dialog-base");
                  if( $kdb.get(0).scrollHeight > $kdb.height() ){

                    $("#modal_dialog_box").css("top", gvar.offsetLayer+"px")
                  }
                }, 10);
              }
              else{
                msg = (parsed.message ? parsed.message : 'something went wrong');
                func = function(){
                  $box_preview
                    .html('<div class="qrerror">'+msg+'</div>');
                };
                _NOFY.btnset = false;
                _NOFY.init({mode:'error', msg:msg, cb:func});
              }

              // std-operation
              _BOX.attach_userphoto('#cont_button .qr_current_user', 'Signed in as ');

              if( !gvar.user.isDonatur ){
                if( gvar.edit_mode || gvar.is_solvedrobot )
                  $btn_prepost.addClass('goog-btn-primary').removeClass('goog-btn-red');
                else
                  $btn_prepost.removeClass('goog-btn-primary').addClass('goog-btn-red');
              }
              $btn_prepost.focus().delay(1200);
              
              // eof--over-ride handler
              // -=-=--=-=--=-=--=-=--=-=--=-=-
            },
            error: function(){
              _AJAX.refetch_current_page();
            }
          });
      }catch(e){}
    });
  },
  submit: function(){
    if(!gvar.user.isDonatur && !gvar.edit_mode && gvar.thread_type!='group'){
      $('#qr-g-recaptcha-response').val( $('#kqr_recaptcha2').find("[name=g-recaptcha-response]").val() );
    }

    /**
    * identify & parse text if it's real json formated
    * expected output:
    * {message:'', error:(Boolean), error_recapctha:(Boolean), securitytoken:'', redirect:''}
    */
    var parse_json_object = function(text){
      if( !("undefined" != typeof text && text) || "string" != typeof text ) {
        clog("already object or a blank");
        return ( "object" === typeof text ? text : !1);
      }
      text = trimStr( text );

      var json_obj, pos, ctext, tmptext;
      var clean_html = function(dtext){

        var $div = $('<div />').html( dtext );
        return $div.text();
      };

      if ( is_good_json(text) ) {
        clog("is_good_json");

        tmptext = clean_html(text);
        clog("tmptext lv1="+tmptext);

        if( tmptext )
        try{
          json_obj = JSON.parse(tmptext)
        }catch(e){ clog(e.message )}
      }else{
        var doctype = '<!DOCTYPE';
        clog("BAD-JSON..");

        if( gvar.thread_type == 'group' ){
          clog("group-discusstion detected, parsing html..");

          var $redirect, $div, nojstext = text;
          nojstext = nojstext.replace(/\r|\n/gi,'');
          nojstext = nojstext.replace(/<\/?script[^>]>/gi,'');
          $div = $('<div />').html( nojstext );

          json_obj = {error:!1, message:'', redirect:''};
          if( text.indexOf('ank you for posti') !== -1 ){
            // posted
            
            $redirect = $div.find('a[href*="/group/discussion/"]').first();
            if( $redirect.length ){
              json_obj.message = 'Thank you for posting!';
              json_obj.redirect = $redirect.attr("href");
            }
            else{
              json_obj.error = true;
              json_obj.message = 'Error, redirect link not found.';
            }
          }
          else{
            json_obj.message = $div.find(".message").text();
            json_obj.error = true;
            json_obj.redirect = !1;
          }
        }
        else{
          clog("cleaning doctype...");

          pos = text.indexOf(doctype);
          if( pos !== -1 ){
            ctext = text.substring(0, pos);

            if( ctext && is_good_json(ctext) ){
              clog("is_good_json, level2");

              tmptext = clean_html(ctext);
              clog("tmptext lv2="+tmptext);
              if( tmptext )
              try{
                json_obj = JSON.parse(tmptext)
              }catch(e){ clog(e.message )}
            }
          }
        }
      }
      return "undefined" != typeof json_obj && json_obj ? json_obj : false;
    };

    
    var $box_info = $('#box_response_msg');
    $box_info
      .removeClass('ghost qrerror qrinfo')
      .addClass('g_notice qrinfo')
    ;
    if( !gvar.edit_mode && gvar.settings.always_notify ){

      $("#box_post").addClass('goog-btn-disabled');

      if( !gvar.fetched_token_post ){
        $box_info.html('Notifying Users...').show();

        _BOX.check_usernotify();
        clog("submit-postponed");
        return !1; // this is required!
        // -= HALTED =-
      }
      
      gvar.fetched_token_post = null;
    }

    var query = _BOX.buildQuery(true);
    if( gvar.thread_type == 'group' )
      query["sbutton"] = encodeURI( 'Post+Message' );
    else
      query["sbutton"] = encodeURI( gvar.edit_mode ? 'Save+Changes':'Submit+Reply' );

    _BOX.postloader(true);
    
    // insist to show it, after postloader
    $box_info.html('Wait for it...').show();

    try{
      clog('ignite post=' + _BOX.e.boxaction );
      clog('query=' + JSON.stringify(query) );
      
      gvar.sTryRequest = $.post( _BOX.e.boxaction, query, function(data) {
        // clog(data);
        var sdata, msg = 'Unknown Error';
        var redirect = null, is_error = null;
        
        clog("edit_mode: " ? gvar.edit_mode : 'nope');
        // new-post
        if( !gvar.edit_mode ){

          if( data )
            data = parse_json_object( data );

          if( data ){
            
            msg = (data.message ? String(data.message) : msg);
            if( data.error ){
              is_error = 1;

              if( data.error_recapctha ){
                // any particular handler?
              }
            }
            else{
              redirect = (data.redirect ? data.redirect : null);
              if( !redirect && data.post_id ){
                // make it your self, then..
                redirect = '/post/'+data.post_id+'#post'+data.post_id;
              }
            }

            // update token
            if( data.securitytoken ){
              gvar._securitytoken = data.securitytoken;
              $('#qr-securitytoken').val(gvar._securitytoken);
            }
          }
          else{
            is_error = 1;
            clog("parsing data failure")
          }

          // decision-stage
          if( is_error && !redirect ){
            _BOX.postloader(false);

            $('#box_response_msg')
              .html( String(data.message) )
              .removeClass('ghost qrerror qrinfo')
              .addClass('g_notice qrerror')
              .show();
          }
          else{
            // good go
            setValue(KS+'TMP_TEXT', '', function(){
              if( redirect ){
                if( data.message )
                  $box_info.html(data.message);

                setTimeout(function(){
                  location.href = redirect;
                }, 345);
              }
              else
                alert("Redirect link not found");
            });
            return;
          }
        }
        // update post
        else{
          try{
            // this may trigger error
            sdata = data.replace(/(\r\n|\n|\r|\t|\s{2,})+/gm, "").replace(/\"/g, '"').toString();
            clog(sdata);

          }catch(e){
            clog('submit post failed, '+e.message);
          }

          if( cucok = /<meta\s*http\-equiv=[\"\']REFRESH[\"\']\s*content=[\"\']\d+;\s*url=([^\"\']+)/i.exec(sdata) ){

            $("clear-draft").trigger("click");
            setValue(KS+'TMP_TEXT', '', function(){
              // NO-Error, grab redirect location
              location.href = cucok[1];
            });

            setTimeout(function(){
              location.reload(false);
            }, 567);
          }else{
            msg  = 'redirect link not found, post might fail. please try again.';
            clog(msg);
            args = {mode:'error', msg:msg, btnset:false };
            _NOFY.init(args);
          }
        }
      });
    }catch(e){};
  },
  postloader: function(flag){
    var ids = ['recaptcha_widget','box_progress_posting','box_response_msg','box_post']
       ,cls = ['ghost','activate-disabled','activated','mf-spinner','goog-btn-disabled'];

    if(flag){
      $('#'+ids[0]).addClass( cls[0] ); // tohide capcay-box
      $('#'+ids[1]).removeClass(cls[1]).addClass( cls[2]+' '+cls[3] );
      $('#'+ids[2]).hide();
      $('#'+ids[3]).addClass( cls[4] );
    }else{
      $('#'+ids[0]).removeClass( cls[0] );
      $('#'+ids[1]).removeClass( cls[3]+' '+cls[2] ).addClass( cls[1] );
      $('#'+ids[3]).removeClass( cls[4] );
    }
  },
  observe_recaptcha_wrapper: function(targetElement){
    if( !("undefined" != typeof targetElement && targetElement) ) return;

    clog("inside observe_recaptcha_wrapper");

    // create an observer instance of changing attribute
    var maxIter = 50, steps=0;
    var observer = new MutationObserver(function(mutations) {
      var BreakException = {};
      try{
        mutations.forEach(function(mev) {
          var $el = $(mev.target),
            is_visible = (getComputedStyle($el.get(0)).getPropertyValue("visibility") == 'visible'),
            is_observed = $el.hasClass("modal-rc2-pls-container")
          ;
          if( is_observed ) throw BreakException;

          clog('tick...; is_visible:'+is_visible );
          if( is_visible && !is_observed ){
            setTimeout(function(){
              $el.addClass("modal-rc2-pls-container");

              if( !$el.hasClass("events") ){
                $el.click(function(e){

                  $(e.target||e)
                    .css("visibility", "hidden")
                    .removeClass("modal-rc2-pls-container")
                  ;

                  $("body").trigger("click");
                }).addClass("events");
              }
            }, 0);
          }
          steps++;

          if( steps > maxIter ){
            clog("steps-exceed treshold, disconecting observer");
            steps = 0;
            _BOX.e.observer && 
              _BOX.e.observer.disconnect();

            clog("sto.reinitiate observe in 2 secs");
            setTimeout(function(){
              _BOX.observe_recaptcha_wrapper( targetElement );
            }, 2345);
            throw BreakException;
          }
        });
      }catch(e){

        if(e!==BreakException) throw e;
      }
    });

    // pass in the target node, as well as the observer options
    observer.observe(targetElement, {
      attributes: true,
      childList: false,
      characterData: false
    });
    _BOX.e.observer = observer;  
  },
  event_recaptcha_watch_handler: function(ev){
    clog("inside event_recaptcha_watch_handler");
    var $el, $elparent, touched, params = _BOX.e.watch_params;

    if( ev.type == 'DOMNodeInserted' ){
      $el = $(params.watch);
      is_touched = (isDefined($el.attr("touch")) && $el.attr("touch") == 'kqr');

      if( $el.length && !is_touched ){
        $elparent = $el.parent();
        _BOX.observe_recaptcha_wrapper( $elparent.get(0) );

        // flag to not come-around (again)
        $el.attr("touch", "kqr");
      }
    }
  },
  event_recaptcha_watch: function(enabled, params){
    if( enabled ){
      _BOX.e.watch_params = params;

      clog("binding DOMNodeInserted");
      $("body").bind("DOMNodeInserted", _BOX.event_recaptcha_watch_handler);
    }
    else{
      clog("unbind DOMNodeInserted");
      $("body").unbind("DOMNodeInserted", _BOX.event_recaptcha_watch_handler);

      if( _BOX.e.observer ){
        clog("disconnect observer");
        _BOX.e.observer.disconnect();
        _BOX.e.observer = null;
      }
    }
  },
  presubmit: function(){
    if(_BOX.e.ishalted) return;
    // init preview
    $('#'+_BOX.e.dialogname).css('visibility', 'visible');

    var $judulbox, $baseparent, $parent, $box_post, is_require_captcha;
    is_require_captcha = !(gvar.user.isDonatur || gvar.thread_type == 'group');


    // modal_capcay_box
    $baseparent = $("#wrap-recaptcha_dialog");
    $parent = $("#modal_capcay_box");
    $judulbox = $parent.find(".modal-dialog-title-text");
    $box_post = $parent.find("#box_post");

    $box_post
      .removeClass('goog-btn-disabled')

    if( is_require_captcha ){
      if( !$('#kqr_recaptcha2').html() )
        do_click( $("#hidrecap_btn").get(0) );
    }
    else{
      $judulbox.text('Posting....');
    }


    if( gvar.edit_mode ){
      
      $judulbox.text('Saving Changes');
      $parent.find("#recaptcha_widget").hide();
      
      $parent.find("#box_progress_posting")
        .removeClass('activate-disabled')
        .addClass('activated')
        .addClass('mf-spinner')
      ;
      $box_post
        .addClass('goog-btn-disabled')
        .html('Posting');
      $parent.find(".ycapcay label").hide();
    }


    $parent.find("#box_response_msg").html('').hide();
    $baseparent.removeClass("ghost");
    $parent.show();

    resize_popup_container();

    if( !$parent.find('.kqr-icon-close').hasClass("events") )
      $parent.find('.kqr-icon-close').click(function(){
        close_popup();
        if( is_require_captcha )
          _BOX.event_recaptcha_watch( !1 );
      }).addClass("events");

    myfadeIn( $('#'+_BOX.e.boxcapcay), 50 );
    _BOX.attach_userphoto('#cont_button .qr_current_user');


    if( is_require_captcha && !gvar.edit_mode ){
      // cek capcay
      if( gvar.is_solvedrobot )
        _BOX.submit();
      
      // assign dynamic body events
      var $pls_container, pls_container = ".pls-container", is_touch;
      $pls_container = $(pls_container);
      is_touch = $pls_container.attr("touch");

      clog("pls_container="+$pls_container.length);

      if( !$pls_container.length )
        _BOX.event_recaptcha_watch(true, {watch: pls_container});
      else
        _BOX.observe_recaptcha_wrapper( $pls_container.parent().get(0) );

      $box_post.click(function(e){
        // simplecheck: recaptcha2 this hidden textarea is filled
        if( $('#kqr_recaptcha2').find("[name=g-recaptcha-response]").val() )
          _BOX.submit()

        e.preventDefault();
        return !1;
      });
      gvar.$w.setTimeout(function(){
        $box_post.focus();
      }, 234);
    }
    else{
      // donat
      _BOX.submit();
    }
  },

  check_usernotify: function(){
    clog("inside check_usernotify");

    var editortext = $("#"+gvar.tID).val();
    var parts = editortext.split("[QUOTE=");
    if( parts.length <= 1 ){
      gvar.fetched_token_post = true;
      _BOX.submit();
      return;
    }

    // collect all post_ids
    var cucok, post_ids = [];
    var fetch_get_token = function(ids){
      var rnd, action_url = $('#formform').attr("action");
      rnd = 'ifc-' + gvar.sversion+'-'+gvar.scriptMeta.timestamp;
      if( $("#"+rnd).length ) return !1;

      // this will behave like doing multi-quote to given ids
      (function(ids_){
        $("#tmp_chkVal").val( ids_ );
        $("#qr_remoteIC").trigger("click");
      })(ids);
      
      clog("iframe="+action_url);
      $("body")
        .append('<iframe id="'+rnd+'" src="'+action_url+'" class="ghost" onload="ifrdone(this, \'#qr_signsectok\')"></iframe>');

      return !1;
    };

    for(var i=0, iL=parts.length; i<iL; i++){
      if( cucok = /[^;]+.(\w{24})\]/i.exec(parts[i]) )
        post_ids.push( cucok[1] );
    }

    if( post_ids.length > 0 ){
      post_ids.sort();
      fetch_get_token( post_ids );
    }
  },
  attach_userphoto: function(target, dt_ori){
    var neim = gvar.user.name + (gvar.user.isDonatur ? ' [$]' : '');
    !dt_ori && (dt_ori = 'Post as ');
    $(target)
      .html('')
      .append('<img src="'+ gvar.user.photo +'" title="'+ dt_ori + neim +'" title="'+dt_ori + neim +'" />');
  }
};

/*
* object urusan ajax
* method yg dihandle: quote, edit, 
* outside _BOX doin ajaxify; eg. quote; edit;
*/
var _AJAX = {
  e: {
     task: "quote" //[quote, edit]
    ,ajaxrun: false // current-run
  },
  init: function(){},
  get_formact_norm: function(){
    var uri = trimStr( $('#formform').attr('action') );
    uri = uri.replace(/\/?\&?post=(?:[^\b\&]+)?/gi, '');
    if( uri.indexOf('?') === -1 ){
      if( uri.lastIndexOf('/') !== (uri.length -1) )
        uri += '/';
      uri += '?';
    }
    return uri;
  },
  ajaxPID: function(mode, running){
    if(!mode) return;
    if( _AJAX.e.ajaxrun && running !== false ){
      try{
        clog('Other AJAX instance ['+_AJAX.e.ajaxrun+'] is currently running, killing him now.');
        gvar.sTryRequest.abort();
        gvar.ajax_pid[_AJAX.e.ajaxrun] = 0;
      }catch(e){}
    }
    gvar.ajax_pid[mode] = (running === false ? 0 : (new Date().getTime()) );
    _AJAX.e.ajaxrun = (false !== running && !running ? mode : false);
    
    clog('ajaxrun = ' + _AJAX.e.ajaxrun);
  },
  quote: function(obj, cb_before, cb_after){
    
    _AJAX.e.task = 'quote';
    var post_ids, uri = _AJAX.get_formact_norm();
    post_ids = $('#tmp_chkVal').val();
    if( post_ids )
      post_ids = post_ids.split(',');

    uri+= 'post='+post_ids[0];
    clog('uri=' + uri);
    
    if( _AJAX.e.task && gvar.ajax_pid[_AJAX.e.task] ) {
      clog('AJAX '+_AJAX.e.task+' is currently running, abort previous...');
      try{
        gvar.ajax_pid[_AJAX.e.task].abort();
      }catch(e){}
    }
    try{
      _AJAX.ajaxPID('quote');
      if(typeof(cb_before)=='function') cb_before();
      
      rnd = 'ifrf-' + gvar.sversion+'-'+gvar.scriptMeta.timestamp;
      if( !$("#"+rnd).length )
        $("body")
          .append('<iframe id="'+rnd+'" src="'+uri+'" class="ghost" onload="ifrdone(this, \'#qr_getcont\')"></iframe>');

      // eof-everything to fetch quote
      // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=

    }catch(e){
      clog('FAILED = ' + uri);
      _AJAX.ajaxPID('quote', false);
    }
  },
  edit_cancel: function(focus){
    var conf = confirm('You are currently editing a post.\n\nDiscard anyway?');
    if( conf ){
      var $XK = $("#"+gvar.qID);
      clog('edit canceling; switching Token:\nold=' + gvar._securitytoken + '; now using:' + gvar._securitytoken_prev);
      
      gvar._securitytoken = gvar.inner['reply']['stoken'];
      $('#qr-securitytoken').val(gvar._securitytoken);
      
      gvar.edit_mode = 0;
      _AJAX.e.task = 'post';
      $XK.find('#formform')
        .attr('action', '/post_reply/' + gvar.pID )
        .attr('name', 'postreply' );
      $XK.find('.inner_title').html( gvar.inner.reply.title );
      $XK.find('#sbutton').val( gvar.inner.reply.submit );
      if( !gvar.user.isDonatur )
        $XK.find('#sbutton').removeClass('goog-btn-primary').addClass('goog-btn-red');
      
      _TEXT.set("");
      _TEXT.pracheck(focus);
      _NOFY.dismiss();
      
      // reset title
      $XK.find(".ulpick_icon").show();
      $XK.find("#hid_iconid").val(0);
      $XK.find("#form-title").val("");
      $XK.find("#img_icon").attr("src", gvar.B.nocache_png);
      $XK.find(".edit-options, #img_icon, #close_title, #kqr-title_message, .edit-reason, .ts_fjb-tags, .ts_fjb-type, .ts_fjb-kondisi, .ts_fjb-price")
        .hide();

      if( gvar.readonly ){
        $('#'+gvar.qID).find('[type=submit]').addClass('goog-btn-disabled');

        if( $('.button_qrmod').hasClass('hide') )
          $('.xkqr').addClass('hide').hide();
      }
    }
    return conf;
  },
  edit: function(obj, cb_before, cb_after){
    _AJAX.e.task = 'edit';
    
    if( gvar.ajax_pid[_AJAX.e.task] ) {
      clog('AJAX '+_AJAX.e.task+' is currently running, abort previous...');
      try{
        gvar.ajax_pid[_AJAX.e.task].abort();
      }catch(e){}
    }
    try{
      var $XK = $("#"+gvar.qID);

      _AJAX.ajaxPID('edit');
      if(typeof(cb_before)=='function') cb_before();

      gvar.edit_mode = 1;
      var uri, href; 
      href = trimStr( obj.attr('href').toString() );
      uri = (href.indexOf(gvar.domain)==-1 ? gvar.domain.substring(0, gvar.domain.length-1) : '') + href;
      
      gvar.sTryRequest = $.get( uri, function(data) {
        
        var valid, parsed, cucok, cdata, $sdata, el, is_error=false;
        
        // decodeURIComponent can raise malformed URI 
        // when string containing %
        try{
          
          cdata = ( String(data).replace(/\\\"/g, '') ).replace(/(\r\n|\n|\r)/gm, "\\n").toString();
        }catch(e){

          clog('error raised, '+e.message);
        }

        // better check page is loaded or not before doin below actions
        // is_error checking..

        // backup current securitytoken, before it get switched
        gvar._securitytoken_prev = gvar._securitytoken;
        gvar.inner['reply']['stoken'] = gvar._securitytoken_prev;
        valid = tokcap_parser(data);
        
        // is_error checking
        if( !valid || is_locked(data) ){
          
          clog("validity error, why?");
          clog(valid);
          _NOFY.raise_error(data);

        }else{
          if( gvar.readonly ){
            // restore disable mode, abort disability            
            clog('restore from disable-mode');
            
            if( !gvar.user.photo ){
              if( cucok = /<li\s+id=.\bafter-login[^>]+.((?:<[^>]+.){3}Hi,\s([^<]+))/i.exec(data) ){
                gvar.user["name"] = ("undefined" != cucok[2] ? cucok[2] : "");
                
                cucok = /\b(http\:\/\/[^\'\"]+)/.exec(cucok[1]);
                cucok && (gvar.user.photo = cucok[1]);
              }
            }

            if( !$('#qr-modalBoxFaderLayer').length )
              finalizeTPL();

            $('#'+gvar.qID).find('[type=submit].goog-btn-disabled').removeClass('goog-btn-disabled');
          }

          $('#formform')
            .attr('action', uri)
            .attr('name', 'edit_postreply');
          
          parsed = cdata.substring(0, cdata.indexOf('</textar'));
          clog('parsed=' + parsed);

          if( cucok = /<textarea[^>]+>(.+)?/im.exec(parsed) ){
            var re, tmptext, tplpart, ttitle, cfg, layout;
            
            _TEXT.init();
            
            // dom-wrapper
            parsed = data.replace(/<\/?script(?:[^>]+)?>/gi, '', data);
            $sdata = $(parsed);
            clog('cleanup while from script-tag='+parsed);

            // check for title
            ttitle = false;
            el = $('input[name=title]', $sdata);
            if( el.length ){
              ttitle = {
                 icon: $('#title-message ul.dropdown-menu [name=iconid]:checked', $sdata).val()
                ,text: el.val()
              };
              clog('ttitle-msg=');
              clog(ttitle);
            }
            else
              clog("[name=title] not found")

            if( ttitle )
              _TEXT.set_title( ttitle );

            // check for reason
            ttitle = false;
            el = $('input[name=reason]', $sdata);
            if( el.length ){
              ttitle = {text: el.val()};
              _TEXT.set_reason( ttitle );
            }
            else
              clog("[name=reason] not found")

            // check additionl opt
            ttitle = false;
            el = $('select[name=folderid]', $sdata);
            if( el.length ){
              ttitle = {
                subscriptions: el.html(),
                rating: $('select[name=rating]', $sdata).find('option[selected="selected"]').val()||null,
                emailupdate: $('select[name=emailupdate]', $sdata).find('option[selected="selected"]').val()||null,
                convertlink: $('input[name=parseurl]', $sdata).is(':checked')
              };
              _TEXT.set_additionl_opt( ttitle );
              $XK.find('#additionalopts, .edit-options').show();
              $XK.find('.additional_opt_toggle').addClass('active');
            }
            else
              clog("[name=folderid] not found");

            // check if fjb and is first post
            el = $('select[name=prefixid]', $sdata);
            if( gvar.classbody.match(/\bfjb\b/i) && el.length ){
              ttitle = {
                 tipe:    el.find('option[selected="selected"]').val()
                ,harga:   $('input[name="harga"]:first', $sdata).val()
                ,kondisi:   $('select[name="kondisi"]', $sdata).find('option[selected="selected"]').val()
                ,tags:    $('input[name="tagsearch"]:first', $sdata).val()
              };
              clog('got fjbdetail = ' + JSON.stringify(ttitle) )
              _TEXT.set_fjbdetail( ttitle );

              // rating should be there for TS (seller)..
              $XK.find(".adt-item.adt-rating").css("visibility", "hidden");
              $XK.find(".edit-reason").hide();
            }
            else{
              if( el.length )
                clog("[name=prefixid] not found");

              _TEXT.set_fjbdetail(null);
              $XK.find(".adt-item.adt-rating").css("visibility", "visible");
              $XK.find(".edit-reason").show();
            }
            
            // layouting ...
            cfg = String(gvar.settings.userLayout.config).split(',');
            layout = gvar.settings.userLayout.template.toLowerCase()
            
            tmptext = trimStr( unescapeHtml( cucok[1].replace(/\\n|\\r\\n|\\r/g, '\n') ) );
            
            if( cfg[1]==1 && layout ){
              
              tplpart = layout.split('{message}');
              re = new RegExp( '^' + tplpart[0].replace(/(\W)/g, "\\" + "$1"), "");
              if( re.test(tmptext.toLowerCase()) )
                tmptext = tmptext.substring(tplpart[0].length, tmptext.length);
                
              re = new RegExp(tplpart[1].replace(/(\W)/g, "\\" + "$1") + '$', "");
              if( re.test(tmptext.toLowerCase()) )
                tmptext = tmptext.substring(0, (tmptext.length-tplpart[1].length) );
            }

            $XK.find('.inner_title').html( gvar.inner.edit.title );
            $XK.find('#sbutton').val( gvar.inner.edit.submit );
            if( !gvar.user.isDonatur )
              $XK.find('#sbutton').addClass('goog-btn-primary').removeClass('goog-btn-red');

            _TEXT.set( tmptext );
            _TEXT.pracheck();
            _TEXT.lastfocus();
          }
          else{
            clog("textarea not found");
          }

          $XK.find('#scancel_edit').show();
          
          if(typeof(cb_after)=='function') cb_after();
        }
        _AJAX.ajaxPID('edit', false);
      })
        .fail(function(){
          _AJAX.refetch_current_page();
        })
      ;
    }catch(e){ 
      gvar.edit_mode = 0;
      _AJAX.ajaxPID('edit', false);
    };
  },
  scustom_parser: function(msg){
    // trim content msg
    msg = trimStr( msg );
    if( !gvar.settings.scustom_noparse ) 
        return ( !msg.match(/\[\[([^\]]+)/gi) ? msg : _AJAX.do_parse_scustom(msg) );
    else
        return msg;
  },
  do_parse_scustom: function (msg){
    var buf = msg;
    var paired, re, re_W, cV, tag, maxstep, done=false, lTag='', retag=[];
    // avoid infinite loop, set for max step
    maxstep = 200;
    
    // prepared paired key and tag of custom image
    paired = _AJAX.prep_paired_scustom();

    while(!done && maxstep--){
      tag = /\[\[([^\]]+)/.exec(buf);
      if( tag ){
        re_W = '\\[\\[' + tag[1].replace(/(\W)/g, '\\$1') + '\\]';
        re = new RegExp( re_W.toString() , "g"); // case-sensitive and global, save the loop
        if( isDefined(tag[1]) && isDefined(paired['tag_'+tag[1]]) && tag[1]!=lTag ){
          clog('parsing['+tag[1]+']...');
          cV = paired['tag_'+tag[1]];
          buf = buf.replace(re, (/^https?\:\/\/\w+/i.test(cV) ? '[IMG]'+cV+'[/IMG]' : unescape(cV) ) );
          lTag = tag[1];
        }else{
          clog('no match tag for:'+tag[1]);
          buf = buf.replace(re, '\\[\\['+tag[1]+'\\]');
          retag.push(tag[1]);
        }
      }else{
        done=true;
      }
    } // end while
    
    if(retag.length){
      clog('turing back');
      buf = buf.replace(/\\\[\\\[([^\]]+)\]/gm, function(S,$1){return('[['+$1.replace(/\\/g,'')+']')});
    }   
    clog('END of do_parse_scustom process=\n' + buf);
    return buf;
  },
  prep_paired_scustom: function (){
    // here we load and prep paired custom smiley to do parsing purpose
    // make it compatible for old structure, which no containing <!!>
    var grup, sml, idx=0, paired = {};

    // preload smiliecustom database, should be done before (early)
    for(var grup in gvar.smcustom){
      sml = gvar.smcustom[grup];
      /** gvar.smcustom[idx.toString()] = [parts[1], parts[0], parts[0]];
      # where :
      # idx= integer
      # gvar.smcustom[idx.toString()] = [link, tags, tags];
      # deprecated for unicode emote support:
      # # if(sml[j].toString().match(/^https?\:\/\//i)) {
      */
      for(var j in sml){
        if( typeof(sml[j]) != 'string' ) {
          paired['tag_'+sml[j][1].toString()] = sml[j][0].toString();
          idx++;
        }
      }
    }
    return paired;
  },
  // refetch current page to make sure we still have session on page
  refetch_current_page: function(){
    gvar.sTryRequestValidate = $.get(location.href, function(data){
      var valid = tokcap_parser(data),
        mH = ( parseInt( getHeight() ) - gvar.offsetMaxHeight - gvar.offsetLayer );

      $('#box_preview').length && 
        $('#box_preview').css('max-height', mH + 'px');

      if( !valid ){
        if( $('#modal_capcay_box').length )
          close_popup();

        _NOFY.raise_error(data, true);
      }
    });
  }
};

/*
* object urusan notifikasi
* any event that will lead to notification 
* above textarea handled on this object
*/
var _NOFY = {
  // whether [quote, edit, error]
  // ----
  mode  : 'quote',
  row_id  : '', // active row being edit
  btnset  : true,
  msg   : '',
  cb    : null,
  // ----
  init: function( args ){
    var _ME = this;
    for(field in args){
      if( !isString(field) ) continue;
      _ME[ field.toString() ] = args[field];
    } 

    clog('_NOFY inside :: ' + JSON.stringify(args) );
    _ME.exec();
  },
  exec: function(mode){
    var _ME = this,
      $par = $("#notify_wrap"),
      $nmsg = $('#notify_msg')
    ;

    if( _ME.msg ){
      $nmsg.html(_ME.msg);

      // default dismiss of btn-dismiss class
      if( $nmsg.find('.btn-dismiss').length && !$nmsg.find('.btn-dismiss').hasClass('events') )
        $nmsg.find('.btn-dismiss').click(function(){
          _ME.dismiss()
        });
    }
    else { // if(null == _NOFY.msg)
      $nmsg.html('Unknown error, please <a class="btn-reload" href="javascript:;">reload the page</a>');
      $nmsg.find('.btn-reload').click(function(){
        window.setTimeout(function(){ location.reload(false) }, 50);
      });
      // this should be just here, avoid editor-focused on click multi-quote
      close_popup(); 
      _ME.btnset = false;
    }

    // neutralizing
    $nmsg.removeClass('qrerror');
    $.each(['scancel_edit','quote_btnset'], function(){
      $('#'+this).hide()
    });

    switch(_ME.mode){
      case "error":
        $nmsg.addClass('qrerror');
      break;
      case "quote":
        var $qb = $('#quote_btnset'),
            $qq_btn = $qb.find("#squick_quote");

        $qb.show();
        $qb.find(".goog-btn").prop("disabled", false);

        if( _ME.no_quickquote )
          $qq_btn.hide();
        else
          $qq_btn.show();
      break;
      case "edit":
        $('#scancel_edit', $par).show();
      break;
    }

    if( !_ME.btnset )
      $('.qr-m-panel .goog-btn', $par).addClass("goog-btn-disabled");
    else
      $('.qr-m-panel .goog-btn', $par).removeClass("goog-btn-disabled");


    _ME.show( true );

    if(typeof(_ME.cb)=='function') _ME.cb();
  },
  raise_error: function(data, session_lost){
    var _ME, func = null, _msg='';
    _ME = this;

    // session lost; invalid post?
    if( data.match(/\byou\sdo\snot\shave\spermission\sto\sac/i) ||
      data.match(/<div\s*class=[\'\"]login-form-(?:wrap|center)[\'\"]/i) ||
      ("undefined" != typeof session_lost) && session_lost
    ){
      _msg = 'You do not have permission to do this. <div><a class="btn-reload" href="javascript:;">Reload page?</a></div>';
      func = function(){
        if( !_AJAX.e.ajaxrun )
          $('#box_preview').html('<div class="qrerror errorwrap">'+_msg+'</div>');

        $('.btn-reload').each(function(){
          $(this).click(function(){
            window.setTimeout(function(){ location.reload(false) }, 50);
          });
        })
      };
    }
    else if(data.match(/\bkepenuhan\b/i)){
      // bad guessing, i knew.. x()
      _msg = 'Kaskus Kepenuhan? <a class="btn-retry" '+(_AJAX.e.ajaxrun ? 'data-toretry="'+_AJAX.e.ajaxrun+'"' : '')+'href="javascript:;">Try Again</a> | <a class="btn-dismiss" href="javascript:;">Dismiss</a>';
      func = function(){
        if( !_AJAX.e.ajaxrun ){
          $('#box_preview').html('<div class="qrerror errorwrap">'+_msg+'</div>');
          $('.btn-retry').each(function(){
            $(this).click(function(){
              _BOX.preview()
            })
          })
        }
        else{
          $('#notify_msg .btn-retry:first').click(function(){
            var toretry, $tgt, $par = $(this).closest('.col');
            toretry = $(this).data('toretry');
            if(toretry == 'edit'){
              $tgt = $par.find('.user-tools a[href*="/edit_post/"]:first');
              $tgt.length && do_click($tgt.get(0));
            }
            else{
              do_click($('#squote_post').get(0));
            }
          })
        }
      };
    }
    else if( data.match(/\bSorry!\sThis\sthread\sis\sclosed!/) ){
      alert('Sorry! This thread is closed!');
      return;
    }
    else{
      _msg = null;
    }
    _ME.btnset = false;
    _ME.init({mode:'error', msg:_msg, cb:func});
  },
  dismiss: function(){
    var _ME = this;
    _ME.show( false );
    
    if( _ME.row_id ){
      clog('releasing editpost');
      $('#'+_ME.row_id).find('.editpost').removeClass('editpost');
      _ME.row_id = '';
    }

    try{
      gvar.sTryRequest.abort();
    }catch(e){}
  },
  show: function(flag){
    var $mc,
      $nmsg = $('#notify_msg'),
      $ntfy = $("#notify_wrap");

    if( ("undefined" != typeof flag && flag) || ("undefined" == typeof flag) ){
      // used before shoing the element, keep doing this just incase ...
      $nmsg.show();
      $ntfy.show()
        .css("left", '10%')
        .css("top", '-'+($ntfy.find(".notify_box").height()+14) +'px')
      ;

      setTimeout(function(){
        
      }, 0)
    }
    else{
      $nmsg.hide();
      $ntfy
        .removeClass("active")
        .hide();
    }
  }
};

/*
* object urusan text (textarea)
* any controller button will be depend on this
* eg. set any bb-tag, clear, autogrow, etc
*/
var _TEXT = {
  e : null, eNat : null,
  content   : "",
  cursorPos   : [],
  last_scrollTop: 0,
  last_wTop: null,
  init: function() {
    this.e = $('#'+gvar.tID);
    this.eNat = gID(gvar.tID);
    this.content = this.e.val();
    this.cursorPos = this.rearmPos(); // [start, end]
  },
  rearmPos: function(){ return [this.getCaretPos(), gID(gvar.tID).selectionEnd]; },
  subStr: function(start, end){ return this.content.substring(start, end);},
  get_last_wTop: function(){ return this.last_wTop },
  set_last_wTop: function(y){this.last_wTop = y},
  set_title: function(data){
    var $KTM = $("#"+gvar.qID).find("#kqr-title_message");
    $KTM.show();
    $KTM.find('#form-title').focus().val( data.text );
    data && data.text && $('#close_title', $KTM).show();
    do_click( $('li a[data-id="'+ data.icon +'"]', $('#menu_posticon') ).get(0));
  },
  set_reason: function(data){
    $('.edit-reason #form-edit-reason').val(data['text']);
    $('.edit-options, .edit-reason').show();
  },
  set_additionl_opt: function(data){
    var $el;
    $('#additionalopts #folderid').html(data['subscriptions']);
    if( data['rating'] ){
      $el = $('#additionalopts select[name="rating"]');
      $el.find('option[selected="selected"]').removeAttr('selected');
      $el.find('option[value="'+data['rating']+'"]').attr('selected', 'selected');
    }
    $el = $('#additionalopts input[name="parseurl"]');
    if( data['convertlink'] )
      $el.attr('checked', "checked");
    else
      $el.removeAttr('checked');

    $el = $('#additionalopts select[name="emailupdate"]');
    if( data['emailupdate'] ){
      $el.find('option[selected="selected"]').removeAttr('selected');
      $el.find('option[value="'+data['emailupdate']+'"]').attr('selected', 'selected');
    }
  },
  set_fjbdetail: function(data){
    var $XK = $("#"+gvar.qID);
    if( !data ){
      $XK.find('.ts_fjb-tags, .ts_fjb-type, .ts_fjb-kondisi, .ts_fjb-price').hide();
      $XK.find('.ulpick_icon').show();
    }
    else{
      $XK.find('.ts_fjb-tags [type=text]').val(data['tags']);
      $XK.find('.ts_fjb-price [type=text]').val(data['harga']);
      $XK.find('.ts_fjb-type').find('option[selected="selected"]').removeAttr('selected');
      $XK.find('.ts_fjb-type').find('option[value="'+data['tipe']+'"]').attr('selected', 'selected');
      $XK.find('.ts_fjb-kondisi').find('option[selected="selected"]').removeAttr('selected');
      $XK.find('.ts_fjb-kondisi').find('option[value="'+data['kondisi']+'"]').attr('selected', 'selected');
      $XK.find('.ts_fjb-tags, .ts_fjb-type, .ts_fjb-kondisi, .ts_fjb-price').show();
      
      $XK.find('.ulpick_icon').hide();
    }
  },
  set: function(value){
    this.content = value;
    // track latest scrollTop, doing val() might reset it to 0
    this.last_scrollTop = gID(gvar.tID).scrollTop;
    this.last_wTop = getCurrentYPos();
    $('#'+gvar.tID).val( this.content );
    
    _TEXT.init();

    this.saveDraft();
    this.pracheck();
  },
  wrapValue : function(tag, title){
    var st2, start=this.cursorPos[0], end=this.cursorPos[1],bufValue;
    tag = tag.toUpperCase();    
    bufValue = this.subStr(0, start) + 
      '['+tag+(title?'='+title:'')+']' + 
      (start==end ? '' : this.subStr(start, end)) + 
      '[/'+tag+']' + this.subStr(end, this.content.length);
    
    this.set(bufValue);
    st2 = (start + ('['+tag+(title?'='+title:'')+']').length);

    this.caretChk( st2, (st2+this.subStr(start, end).length) );
    return bufValue; 
  },
  add: function(text){ // used on fetch post only
    var newline = '\n\n';
    if( $('#'+gvar.tID).val() != "" )
      this.content+= newline;
    this.last_wTop = getCurrentYPos();
    $('#'+gvar.tID).val( this.content + text );
    this.saveDraft();
    this.pracheck(false);
    
    gvar.$w.setTimeout(function(){
      _TEXT.lastfocus();
    }, 200);
  },
  // ptpos stand to puretext position [start, end]
  setValue : function(text, ptpos){
    var bufValue, start=this.cursorPos[0], end=this.cursorPos[1];
    if(isUndefined(ptpos)) ptpos=[text.length,text.length];
    if(start!=end) {
      this.replaceSelected(text,ptpos);
      return;
    }
    bufValue = this.subStr(0, start) + text + this.subStr(start, this.content.length);
    this.set(bufValue);
    this.caretChk( (start+ptpos[0]), (start+ptpos[1]) );
    return bufValue; 
  },
  replaceSelected : function(text, ptpos){
    var bufValue, start=this.cursorPos[0], end=this.cursorPos[1];
    if(start==end) return;    
    bufValue = this.subStr(0, start) + text + this.subStr(end, this.content.length);
    this.set(bufValue);
    this.caretChk( (start+ptpos[0]), (start+ptpos[1]) );
  },
  pracheck: function(foc){
    clog("commencing pracheck..");
    if( isUndefined(foc) )
      foc = true;
    
    _TEXT.setElastic(gvar.maxH_editor, 1);
    if( $('#'+gvar.tID).val() !="" )
      $('#clear_text').show();
    else
      $('#clear_text').hide();
    if(foc) gvar.$w.setTimeout(function(){
      _TEXT.focus();
    }, 200);
  },
  focus: function(){ 
    $('#'+gvar.tID).focus() 
  },
  lastsroll: function (){
    // scroll to bottom of editor line
    !_TEXT.e && (_TEXT.e = $('#'+gvar.tID));
    _TEXT.e && _TEXT.e.scrollTop(_TEXT.e[0].scrollHeight);
  },
  lastfocus: function (){
    var eText, nl, pos, txt = String($('#'+gvar.tID).val()); // use the actual content
    pos = txt.length;
    nl = txt.split('\n');
    nl = nl.length;
    pos+= (nl * 2);
    eText = gID(gvar.tID);
    try{
      if( eText.setSelectionRange ) {
        _TEXT.focus();
        eText.setSelectionRange(pos,pos);
      }
    }catch(e){}
    gvar.$w.setTimeout(function(){ _TEXT.focus(); _TEXT.lastsroll() } , 310);
  },
  getSelectedText : function() {
    return (this.cursorPos[0]==this.cursorPos[1]? '': this.subStr(this.cursorPos[0], this.cursorPos[1]) );
  },
  getCaretPos : function() {  
    var CaretPos = 0;
    //Mozilla/Firefox/Netscape 7+ support   
    if(gID(gvar.tID))
      if (gID(gvar.tID).selectionStart || gID(gvar.tID).selectionStart == '0')
      CaretPos = gID(gvar.tID).selectionStart;
    return CaretPos;
  },  
  setCaretPos : function (pos,end){
    if(isUndefined(end)) end = pos;
    if(gID(gvar.tID).setSelectionRange)    { // Firefox, Opera and Safari
      this.focus();
      gID(gvar.tID).setSelectionRange(pos,end);
    }
  },
  setElasticEvent: function(enabled, max){
    var delay = 500;

    if( enabled ){
      var resizeEv = function( isforced ){
        var yPos, a = gID(gvar.tID);

        var selisih = 10;
        var isTyping = (a.getAttribute("data-istyping") == 1);

        if( !isforced && isTyping ) return !1;

        clog("scrollHeight="+a.scrollHeight+"; height="+a.style.height);
        if( !isforced && (Math.abs(parseInt(a.scrollHeight) - parseInt(a.style.height)) <= selisih) ) {
          return !1;
        }

        yPos = getCurrentYPos();
        clog("setElasticEvent[resizeEv]:before="+yPos);

        a.style.height = 'auto';
        a.style.height = (parseInt(a.scrollHeight)+2)+'px';
        a.style.setProperty('overflow-y', (!gvar.settings.elastic_editor && a.scrollHeight > max ? 'auto' : 'hidden'), 'important');
        
        if( !isNaN(yPos) && yPos > 0 && getCurrentYPos() != yPos )
          $('html,body').scrollTop(yPos);
      };

      // [Enter, Backspace, Delete]
      var sC = [13, 8, 46];
      var _f = null;
      var $a = $("#"+gvar.tID);

      if( !$a.hasClass("events-keys") ){
        clog("activating event events-keys");

        $a.keydown(function(e){
          // clog("in-keydown keyCode:"+e.keyCode);
          if( sC.indexOf(e.keyCode) !== -1 ){
            if( e.keyCode === 13 ){
              var value = $(this).val(),
                lastPos = _TEXT.getCaretPos(),
                tail = value.substring( lastPos );

              if( !/\n/.test(tail) ){
                $(this).val(value + "\n");
                _TEXT.setCaretPos(lastPos);
              }
            }
            clog("gonna sto forced resizeEv from keydown, keyCode="+e.keyCode);
            setTimeout(function(){ resizeEv( true ) }, 0)
          }
        }).keypress(function(e){
          if( sC.indexOf(e.keyCode) !== -1 ){ return true };

          var $me = $(this);
          $me.attr("data-istyping", 1);
          if( _f )
            clearTimeout( _f );

          _f = setTimeout(function(){ 
            $me.attr("data-istyping", 0);
          }, delay*1.43);
        }).addClass("events-keys");
      }

      // 0--0--0
      clog("gonna sti resizeEv..");
      gvar.sITryFocusEditor &&
        clearInterval( gvar.sITryFocusEditor );

      gvar.sITryFocusEditor = setInterval(resizeEv, delay);
    }
    else{

      clog("clearing sti sITryFocusEditor resizeEv..");
      gvar.sITryFocusEditor &&
        clearInterval( gvar.sITryFocusEditor );
    }
  },
  setElastic: function(max, justAdjust){
    clog("init setElastic");
    var a = gID(gvar.tID), $a;
    if( !a ) return;
    $a = $(a);
    if( !max ){
      if( !gvar.settings.elastic_editor )
        max = gvar.maxH_editor;
    }

    // cache lastYpos
    var yPos = gvar.lastYpos;

    var resize = function() {
      a.style.height = 'auto';
      a.style.height = a.scrollHeight+'px';
      a.style.setProperty('overflow-y', (!gvar.settings.elastic_editor && a.scrollHeight > max ? 'auto' : 'hidden'), 'important');

      if( !isNaN(yPos) && yPos > 0 && getCurrentYPos() != yPos )
        $('html,body').scrollTop(yPos);
    };


    if("undefined" != typeof justAdjust && justAdjust){
      clog("justAdjust..");
      a.setAttribute('style', (!gvar.settings.elastic_editor && max ? 'max-height:'+max+'px;' : ''));
      resize();
    }


    // init-events
    if( !$a.hasClass("events-elastic") ){
      var evs = 'cut,paste,drop'.split(","); //keydown
      for(var i=0, iL=evs.length; i<iL; i++)
        _o(evs[i], a, function(){window.setTimeout(function(){
          yPos = getCurrentYPos();
          resize()
        }, 0)});

      $a.on("focus", function(){
        _TEXT.setElasticEvent( true, max );
      }).on("blur", function(){
        _TEXT.setElasticEvent( false );
      }).addClass("events-elastic");
    }

    clog("setElastic done");
  },
  saveDraft: function(e){
    if(e && (e.ctrlKey || e.altKey) ) return true;
    var liveVal = $('#'+gvar.tID).val();
    if( $('#qrdraft').get(0) && liveVal ){
      $('#qrdraft').html('Save Now').attr('data-state', 'savenow');
      _DRAFT.title('save');
      _DRAFT.switchClass('gbtn');
      $('#draft_desc').html('');
      clearTimeout( gvar.sITryLiveDrafting ); 
      gvar.isKeyPressed=1;
      if( gvar.settings.qrdraft )
        _DRAFT.quick_check();
    }
  },
  caretChk: function(s,e){
    this.setCaretPos(s, e);
    // restore scrollTop on overflow mode:scroll
    if(this.last_scrollTop && _TEXT.overflow!='hidden')
      gID(gvar.tID).scrollTop = (this.last_scrollTop+1);
  }
};

/*
* object urusan textcount
* event keypress di textarea trigger this object
* to show remaining char
*/
var _TEXTCOUNT = {
  init: function( target ){
    var cUL, _tc = this;
    cUL = String(gvar.settings.userLayout.config).split(',');

    _tc.limitchar = (gvar.thread_type == 'group' ? 1000 : 20000);
    _tc.$editor = $('#'+gvar.tID);
    _tc.$target = ("string" == typeof target ? $(target) : target);
    _tc.preload_length = 0;
    if( cUL[1] == '1' ){
      _tc.preload_length = String(gvar.settings.userLayout.template).replace(/{message}/, '').length;
    }   

    if( _tc.$target.length ){
      if(_tc.preload_length > 0)
         _tc.$target.find('.qr_preload').show().text(' (+'+_tc.preload_length+')');
      else
        _tc.$target.find('.qr_preload').hide();

      _tc.$target = _tc.$target.find('.numero:first');
      _tc.$target.text(_tc.count_it(_tc));
    }
    _tc.do_watch(_tc);
  },
  count_it: function(_tc){
    return (_tc.limitchar - _tc.preload_length - _tc.$editor.val().length);
  },
  do_watch: function(_tc){
    _tc.dismiss();
    gvar.sTryTCount = window.setInterval(function() {
      _tc.$target.text( _tc.count_it(_tc) );
    }, 600);
  },
  dismiss: function(){
    gvar.sTryTCount && clearInterval( gvar.sTryTCount );
  }
};


/*
* object urusan draft
* event check for any change in textarea to keep it drafted
*/
var _DRAFT = {
  el: null, dsc: null
  ,_construct: function(){
    _DRAFT.el = $('#qrdraft');
    _DRAFT.dsc= $('#draft_desc');

    _DRAFT.disabled_class = 'goog-btn-disabled';
  }

  ,check: function(){
    clog('checking draft..');
    if( _DRAFT.el.get(0) && _DRAFT.el.attr('data-state')=='idle'){
      gvar.timeOld = new Date().getTime();
      clearInterval(gvar.sITryKeepDrafting);
      // default interval should be 120 sec || 2 minutes (120000)
      gvar.sITryKeepDrafting= window.setInterval(function() { _DRAFT.check() }, 120000);
    }

    var tmp_text= $('#'+gvar.tID).val(), timeNow=new Date().getTime()
    ,selisih=(timeNow-gvar.timeOld), minuten=Math.floor(selisih/(1000*60));

    if( _DRAFT.provide_draft() ) return false;
    if( !tmp_text ) return false;

    // any live change ? 
    if( isDefined(gvar.isKeyPressed) )
      _DRAFT.save();
    else
      _DRAFT.dsc.html( (minuten > 0 ? 'Last saved ' + minuten + ' minutes' : 'Saved seconds') + ' ago' );
  }
  ,provide_draft: function(){
    var tmp_text= $('#'+gvar.tID).val();
    if(tmp_text=="") {
      var blank_tmp = (gvar.tmp_text == "");
      _DRAFT.el.html('Draft').attr('data-state', 'idle');;
      _DRAFT.title( blank_tmp ? '' : 'continue');
      _DRAFT.switchClass( blank_tmp ? _DRAFT.disabled_class : 'gbtn');
      _DRAFT.dsc.html( blank_tmp ? 'blank' : '<a href="javascript:;" id="clear-draft" title="Clear Draft">clear</a> | available');
      $('#clear-draft').click(function(){
        _DRAFT.clear()
      });
      if( !blank_tmp ) return true;
    }
    return false;
  }
  ,title: function(mode){
    var t = (mode=='save' ? 'Save Now' : (mode=='continue' ? 'Continue Draft' : '') );
    if(t!='') 
      _DRAFT.el.attr('title', t+' [Ctrl+Shift+D]');
    else
      _DRAFT.el.removeAttr('title');
  }
  ,save: function(txt){
    _DRAFT.switchClass(_DRAFT.disabled_class);
    if( isUndefined(txt) ){
      _DRAFT.el.html('Saving ...').attr('data-state','saving');
      _DRAFT.title();
      window.setTimeout(function() { _DRAFT.save( $('#'+gvar.tID).val() )}, 600);
      return;
    }else{
      gvar.tmp_text = txt.toString();
      setValue(KS+'TMP_TEXT', gvar.tmp_text);
      _DRAFT.el.html('Saved').attr('data-state','saved');;
      _DRAFT.dsc.html('Saved seconds ago');
      if( isDefined(gvar.isKeyPressed) ) delete gvar.isKeyPressed;
    }
    gvar.timeOld = new Date().getTime();
  }
  ,clear: function(txt){
    gvar.tmp_text = '';
    setValue(KS+'TMP_TEXT', gvar.tmp_text);
    _DRAFT.title('continue');
    _DRAFT.el.html('Draft');
    _DRAFT.switchClass(_DRAFT.disabled_class);
    _DRAFT.dsc.html('blank');
  }
  ,quick_check: function(){
    gvar.$w.setTimeout(function(){ _DRAFT.provide_draft() }, 300);
    gvar.sITryLiveDrafting = gvar.$w.setTimeout(function() { _DRAFT.check() }, 5000); // 5 sec if any live change
  }
  ,switchClass: function(to_add){
    var to_rem = (to_add=="gbtn" ? _DRAFT.disabled_class : "gbtn");
    _DRAFT.el.addClass(to_add).removeClass(to_rem);;
  }
};

/*
* object urusan uploader
* kaskus & custom uploader
*/
var _UPL_ = {
  init: function(){
    _UPL_.tcui = 'tupload';
    _UPL_.self = 'box-upload';
    _UPL_.sibl = 'box-smiley';
    _UPL_.def  = 'kaskus';
    
    _UPL_.main();
  },
  menus: function(){
    var idx=0, ret='';
    if( gvar.upload_sel ){
      ret+=''
        +'<li><div><b>:: Services :: </b></div></li>'
        +'<li><div class="spacer"></div></li>'
        +'<li class="qrt'+("undefined" != typeof gvar.upload_tipe && gvar.upload_tipe == 'kaskus' ? ' curent':'')+'"><div id="tphost_0" title="kaskus.us" data-host="kaskus">kaskus</div></li>'
      ;
      for(var host in gvar.upload_sel){
        ret+='<li class="qrt'+("undefined" != typeof gvar.upload_tipe && gvar.upload_tipe == host ? ' curent':'')+'"><div id="tphost_'+(idx+1)+'" title="'+gvar.upload_sel[host]+'" data-host="'+host+'">' + host + ' <a class="externurl right" title="Goto this site" target="_blank" href="http://'+gvar.upload_sel[host]+'"><i class="fa fa-arrow-circle-right"></i></a></div></li>';
        idx++;
      }
    }
    return ret;
  },
  event_menus:function(){
    $('#'+_UPL_.tcui+' .qrt').each(function(){
      $(this).click(function(e){
        if( (e.target||e).nodeName === 'DIV' ){
          var $me = $(this);
          var subtpl, ch = $me.find('div:first'), id, lbl, gL, host;
          id = ch.attr('id').replace(/tphost_/gi,'');
          host = ch.attr('data-host');

          setValue(KS+'LAST_UPLOADER', host, function(){
            _UPL_.switch_tab( host );
            $me.closest('#ul_group').find('.curent').removeClass('curent');
            $me.addClass('curent');
          });
        }
      });
    });
    $('#toggle-sideuploader').click(function(){
      var $me, $sb, $uc, todo;
      $me = $(this);
      $sb = $me.closest('.wraper_custom').find('.cs_left');
      $uc = $('#uploader_container');
      todo = $me.attr('data-state')

      if(todo=='hide'){
        $sb.hide();
        $uc.parent().removeClass('col-xs-10');
      }else{
        $sb.show();
        $uc.parent().addClass('col-xs-10');
      }

      $me.html( HtmlUnicodeDecode(todo=='hide' ? '&#9658;' : '&#9664;') );
      $me.attr('data-state', todo=='hide' ? 'show' : 'hide' );
    });
  },
  tplcont: function(host){

    return '<div id="content_uploader_'+host+'" class="content_uploader" style="display:none" />';
  },
  main: function(){
    var tpl = '', iner = _UPL_.tcui, $target = $('#'+iner);

    $target.html( rSRC.getTPLUpload( _UPL_.menus() ) );
    _UPL_.event_menus();
    
    tpl = _UPL_.tplcont(_UPL_.def);
    for(var host in gvar.upload_sel)
      tpl+=_UPL_.tplcont(host);
      
    $target.find('#uploader_container').html( tpl );
    _UPL_.switch_tab("undefined" != typeof gvar.upload_tipe ? gvar.upload_tipe : _UPL_.def);
    
    _UPL_.toggletab(true);
  },
  switch_tab: function(target){
    if( !target ) return;
    var tpl, ifname, options, tgt = 'content_uploader_'+ target;
    var $partab = $('#'+tgt);
    
    if( $partab.html()=='' ){
      options = {
        mode: '',
        parent_selector: '#'+tgt,
        preview_wrap_selector: '.preview-image-inner'
      };

      if(target ==_UPL_.def){
        tpl = ''
          +'<div class="preview-image-outer">'
          + '<div class="preview-image-inner" />'
          +'</div>'
          +'<div class="throbber_wrp" style="display:none"><div class="mf-spinner" /></div>'
          +'<div class="image-control">'
          + '<div class="clickthumb" style="display:none">'
          +  '*Click thumbnail image to add to post content'
          +  '<a href="javascript:;" class="rmv-all goog-btn goog-btn-default goog-btn-xs goog-btn-red pull-right">Remove&nbsp;All</a>'
          + '</div>'
          + '<input type="file" onchange="ajaxFileUpload();" name="forumimg" id="browse" class="browse" />'
          +'</div>'
        ;
        $partab.html( tpl );

        // fill in with cached uploaded images
        options.KEY_STR = 'UPLOAD_LOG';
        inteligent_width( options );

        GM_addGlobalScript( gvar.kkcdn + 'themes_2.0/js/ajaxfileupload.js' );
        GM_addGlobalScript( rSRC.getSCRIPT_UPL() );
        
        $('#'+_UPL_.tcui+' .preview-image-inner').bind('DOMNodeInserted DOMNodeRemoved', function(ev) {
          if( ev.type == 'DOMNodeInserted' ){
            $(this).find('.preview-image-unit').each(function(){
              var P = $(this);
              if( P.hasClass('event') ) return;

              P.find('img').click(function(){ do_smile($(this)) });
              P.find('.kqr-icon-close').click(function(){
                if( confirm('Agan yakin mau delete gambar ini?') ){
                  $(this).closest('.preview-image-unit').remove();
                  options.mode = 'remove';
                  inteligent_width( options );
                }
              });
              P.addClass('event');
            });

            options.mode = 'insert';
            inteligent_width( options );
          }
        });

        $partab.find('.rmv-all').click(function(){
          remove_log_uploader( options );
        });
      }
      else{
        ifname = 'ifrm_' + gvar.upload_sel[target].replace(/\W/g,'');
        tpl=''
          +'<div class="host">'
          +'<a target="_blank" title="Goto '+ target +'" href="http://'+gvar.upload_sel[target]+'"><b>http://' + gvar.upload_sel[target] + '</b></a>'
          +'</div>'
          +'<a class="btn_ifrm_reload" href="javascript:;" id="ifrm_reload_'+target+'" data-src="'+gvar.uploader[target]['src']+'">reload</a>'
          +'<ifr'+'ame id="'+ ifname +'" src="http://'+ gvar.uploader[target]['src'] +'"></if'+'rame>'
        ;
        $('#'+tgt).html( tpl );
        $('#ifrm_reload_'+target).click(function(){
          var itgt = $(this).attr('id').replace(/ifrm_reload_/,''), _src = $(this).data('src');
          $('#' + 'ifrm_' + gvar.upload_sel[itgt].replace(/\W/g,'') ).attr('src', 'http://' + _src);
        });
      }
    }
    $('#' + tgt).parent().find('.content_uploader.curent').removeClass('curent').hide();
    $('#' + tgt).addClass('curent').show()
  },
  toggletab: function(doshow){
    var $XK = $("#"+gvar.qID);
    var bu = '.'+_UPL_.self, bb='.box-bottom';
    if( doshow ){
      $XK.find(bu + ', ' + bb).show();
      $XK.find('.'+_UPL_.sibl).hide();
    }else{
      $XK.find(bu + ', ' + bb).hide();
    }
  }
};

/*
* object urusan smilies
* kecil-besar-custom will be maintained here
*/
var _SML_ = {
  init: function(def){
    _SML_.self = 'box-smiley';
    _SML_.sibl = 'box-upload';
    if( !def ) def = 'tkecil';

    _SML_.set_tabfirst( gvar.settings.tabfirst_smiley );
    _SML_.load_smiley( def );
  },
  init_scustom: function(target, smilies){
    // smiley custom thingie
    var $ptarget, gruptpl='', tpl = '', idx = 0;
    var $boxSM = $("#"+gvar.qID).find("."+_SML_.self);

    $ptarget = $boxSM.find(target);
    $ptarget.html( rSRC.getTPLCustom( _SML_.menus_scustom() ) );
    tpl = ''
      +'<input type="hidden" id="current_grup" value="'+ (gvar.smgroup && gvar.smgroup.length > 0 ? gvar.smgroup[0] : '') +'" />'
      +'<input type="hidden" id="current_order" value="'+ (gvar.smgroup ? '0':'') +'" />'
      +'<input type="hidden" id="scustom_todo" value="" />'
      +'<input type="hidden" id="scustom_todel" value="" />'
    ;
    $('#custom_bottom').append( tpl );
    if( gvar.settings.scustom_noparse )
      $('#scustom_noparse').attr('checked', true);
    
    // container rightside: #scustom_container
    gruptpl = 'Position: <select id="pos_group_sets" tabindex="505" class="form-control">';
    tpl = '';
    
    for(grup in smilies){
      tpl+= '<div id="content_scustom_container_'+ grup +'" class="content_scustom" style="display:none"></div>';
      gruptpl+= '<option value="'+idx+'">'+ (idx + 1) +'</option>';
      idx++;
    }
    gruptpl+='</select>';
    
    if( tpl ){
      $('#scustom_container').html( tpl );
      $('#position_group').html( gruptpl );
      $('#manage_help, #manage_cancel, #dv_menu_disabler', $boxSM).addClass("hide");
      $('#scustom_container, #custom_bottom, #title_group', $boxSM).removeClass("hide");
    }
  },
  menus_scustom: function(){
    var gL, ret, spacer='<div style="height:1px"></div>';
    
    ret='<li class="qrt_first">'+spacer+'</li>'
      +'<li class="qrt add_group"><div class="add_group">Add Group</div></li>'
      +'<li>'+spacer+'</li>';
    ;
    if( gvar.smgroup && gvar.smgroup.length > 0 ){
      gL = gvar.smgroup.length;
      for(var i=0; i<gL; i++){
        ret+=''
          +'<li class="qrt'+(i==0 ? ' curent':'')+'"><div id="tbgrup_'+i+'" title="'+gvar.smgroup[i].replace(/_/g, ' ')+'">'
          + gvar.smgroup[i] +'<span class="num">'+(i+1)+'</span></div></li>';
      }
      ret+='<li class="qrt_first">'+spacer+'</li>';
    }
    return ret;
  },

  save_scustom: function(buf){
    var $boxSM = $("#"+gvar.qID).find("."+_SML_.self);
    var target = '#tcustom';

    setValue(KS+'CUSTOM_SMILEY', buf, function(){

      gvar.settings.scustom_noparse = $('#scustom_noparse', $boxSM).is(':checked');
      setValue(KS+'SCUSTOM_NOPARSE', gvar.settings.scustom_noparse ? "1" : "0");
      
      // cold-boot
      var last_mod = parseInt( $('#pos_group_sets', $boxSM).val() );
    
      
      $boxSM.find(target).html('');
      rSRC.getSmileySet(true, function(){
        _SML_.init_scustom(target, gvar.smcustom);
        _SML_.event_scustom();
        
        _SML_.refresh_menus();
        
        if( $('#tbgrup_' + last_mod ).get(0) )
          do_click($('#tbgrup_' + last_mod, $boxSM).get(0));
        else
          do_click($('#tbgrup_0', $boxSM).get(0));
      });
    });
  },
  event_menus: function(){
    var $boxSM = $("#"+gvar.qID).find("."+_SML_.self);

    // add_group
    $boxSM.find('li.add_group').click(function(){
      var rnd = Math.random().toString();
      rnd = rnd.replace(/0\./g, '').substring(0, 3);
      $(this).addClass('curent');

      $('#label_group').text('Add Group');
      $('#manage_btn').text('Save');
      $('#textarea_scustom_container').val('').height(100);
      $('#input_grupname').val('untitled_' + rnd);

      $('#manage_help, #manage_cancel, #custom_bottom, #custom_addgroup_container, #dv_menu_disabler', $boxSM)
        .removeClass("hide");
      $('#scustom_container, #title_group, #delete_grupname', $boxSM)
        .addClass("hide");
      
      do_click($('#label_group').get(0));
      $('#scustom_todo').val('add');
    });

    // menus
    $boxSM.find('#tcustom .qrt').each(function(){
      if( !$(this).hasClass('add_group') )
      $(this).click(function(){

        var retEl, subtpl, ch= $(this).find('div:first'), id, lbl, gL, grup, islink;
        var safe_uesc = function(txt){
          return do_sanitize( unescape(txt) )
            .replace(/\'/g, '&apos;')
            .replace(/\"/g, '&quot;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
        };
        id = ch.attr('id').replace(/tbgrup_/gi,'');
        grup = gvar.smgroup[id];

        if( $('#content_scustom_container_'+grup).get(0) ){
          $('#scustom_container').find('.content_scustom.curent').removeClass('curent').empty().hide();
          $('#content_scustom_container_'+grup).addClass('curent').show();
        }
        $('#current_grup').val( grup );
        $('#current_order').val( id );
        $('#title_group').text( grup.replace(/_/g, ' ') );
        $(this).closest('#ul_group').find('.curent').removeClass('curent');
        $(this).addClass('curent');

        if( !gvar.smcustom ) rSRC.getSmileySet( true );
        if( gvar.smcustom && gvar.smcustom[grup] ){
          subtpl = ''; gL = gvar.smcustom[grup].length
          for(var k=0; k<gL; k++){
            
            if( !isString(gvar.smcustom[grup][k]) ){
              if( isLink( gvar.smcustom[grup][k][0] ) != null ){
                islink = 1;
                subtpl+='<img src="'+ gvar.smcustom[grup][k][0] +'" alt="_alt_'+ gvar.smcustom[grup][k][1] +'" title="[['+ gvar.smcustom[grup][k][1] + '] &#8212;' + gvar.smcustom[grup][k][0] +'" /> ';
              }else{
                try{
                  subtpl+= '<span title="[['+ gvar.smcustom[grup][k][1] +'] '+ HtmlUnicodeDecode('&#8212;') +' '+ safe_uesc( gvar.smcustom[grup][k][0] ) +'" class="nothumb">'+ safe_uesc(gvar.smcustom[grup][k][0]) +'</span>' + ' ';
                }catch(e){}
              }
            }else{
            
              retEl = validTag( gvar.smcustom[grup][k], true, 'view' );
              if( !retEl ) continue;
              if( !/<br\s?\/?>/.test(retEl) ){
                if( subtpl!='' )
                  subtpl+= '<br/>';
                subtpl+= retEl + '<br/>';
              }else{
                subtpl+= retEl;
              }
            }
          }
          $('#content_scustom_container_'+grup).html( subtpl );
          _SML_.event_img('#tcustom', 'tcustom');
        }
      });
    });
  },
  event_scustom: function(){

    var $boxSM = $("#"+gvar.qID).find("."+_SML_.self);

    $boxSM.find('#input_grupname').focus(function(){

      $(this).select()
    }).keydown(function(ev){
      if( [13,27].indexOf(ev.keyCode) !== -1 ){
        $('#formform').attr('ignoresubmit', 1);
        do_an_e( ev );
        return do_click( $(ev.keyCode==13 ? '#manage_btn' : '#manage_cancel').get(0) );
      }
    });
    
    // help
    $boxSM.find('#manage_help').click(function(){
      var nn="\n";
      alert('Each Smiley separated by newline.'+nn
        +'Format per line:'+nn
        +' tag|smileylink_or_autotext'+nn
        +''+nn
        +' eg.'+nn
        +'bersulang|'+ gvar.kkcdn +'images/smilies/sumbangan/smiley_beer.gif'+nn
        +( !gvar.settings.scustom_noparse ? ''
        +''+nn
        +'In that case, you can use custom smiley BBCODE with this format:'+nn
        +'[[bersulang]'+nn
        :'' )
      );
    });

    // cancel
    $boxSM.find('#manage_cancel').click(function(e){
      e.preventDefault();
      $('li.add_group').removeClass('curent');
      
      $('#manage_help, #manage_cancel, #custom_addgroup_container, #dv_menu_disabler, #position_group', $boxSM)
        .addClass("hide");
      $('#scustom_container, #title_group', $boxSM)
        .removeClass("hide");
      
      if( gvar.smgroup.length > 0 ){
        $('#manage_btn').text('Manage');
        $('#custom_bottom', $boxSM).removeClass("hide");
      }else{
        $('#custom_bottom', $boxSM).addClass("hide");
      }
      return !1;
    });

    // manage | save
    $boxSM.find('#manage_btn').click(function(e){
      var task = $(this).html().toLowerCase();
      if(task=='save'){
        var grupname, todo, niubuf,
          cleanGrup = function(){
            return trimStr( $('#input_grupname').val().replace(/[^a-z0-9]/gi,'_').replace(/_{2,}/g,'_') );
          };
        grupname = cleanGrup();
        todel = ($('#scustom_todel').val() == grupname);

        // needed to filter text to saved from smiley-custom
        var do_filter_scustom = function (text){
          var buf = text;
          if( buf!='' ){
            var re, sml, bL, sepr, retbuf='',  done = false;
            var tosingle = {
              '\\|{2,}' : '|'
              ,'(\\r\\n){2,}' : '\r\n{sctag:br}\r\n,'
              ,'(\\n){2,}' : '\n{sctag:br}\n'
            };
            // step -1 to strip
            buf = buf.replace(/[\[\]\,]/g,"");
            
            //clog('step-to single');
            for(var torep in tosingle){
              if(!isString(tosingle[torep])) continue;
              re = new RegExp(torep, "g");
              buf = buf.replace(re, tosingle[torep])
            }
            buf=(document.all ? buf.split("\r\n") : buf.split("\n")); // IE : FF/Chrome
            
            bL=buf.length;
            sepr = ','; // must be used on extracting from storage
            for(var line=0; line<bL; line++){
              if( !isString(buf[line]) ) continue;
              buf[line] = trimStr ( buf[line] ); // trim perline
                //clog('line='+line+'; val='+buf[line]);
              sml = /([^|]+)\|([\w\W]+)/.exec( buf[line] );
              if(sml && isDefined(sml[1]) && isDefined(sml[2]) ){
                // smiley thingie ?
                //clog('sml[0]='+sml[0]+'; sml[1]='+sml[1]+'; sml[2]='+sml[2]);
                retbuf+=sml[1]+'|' + ( /^https?\:\/\/.+$/i.test(sml[2]) ? sml[2] : escape(sml[2]) ) + sepr;
              }else if(sml=validTag( buf[line], false, 'saving' ) ){
                // valid tag ?
                //clog('saving-valid tag ?; ' + sml);
                retbuf+=sml+sepr;
              }
              done=true;
            } // end for    
          }
          return retbuf;
        }
        
        if( niubuf = $('#textarea_scustom_container').val() )
          niubuf = do_filter_scustom( trimStr(niubuf) );

        if( trimStr(grupname)=='' ){
          alert('Group Name can not be empty');
          return !1;
        }else if( !niubuf ){
          alert('Invalid tag and\/or smiley format');
          return !1;
        }else{
          //save custom smiley
          (function remixBuff(niubuf, todel){
            var ret='', curG, oldOrder, curOrder, todo, sEL, nOrder;
            todo = $('#scustom_todo').val();

            if( !niubuf )
              _SML_.save_scustom( false )
  
            if(todo == 'add' && gvar.smcustom[grupname] ){
              alert('Group Name is already exists');
              _SML_.save_scustom( false )
            }else if(todo == 'edit'){
              
              curOrder = $('#current_order').val();
              oldOrder = (curOrder ? curOrder : "");
              curG = [(curOrder ? curOrder : ""), $('#current_grup').val()];
              nOrder = $('#pos_group_sets option:selected').val();

              // reorder-group (manage | not add)
              if(curG[0]!="" && nOrder!=curG[0] && gvar.smgroup){
                var tomove = gvar.smgroup[curG[0]], newGrup=[];
                gvar.smgroup[curG[0]] = null;
                if(nOrder > curG[0])
                  gvar.smgroup.splice( curG[0], 1);
                
                gvar.smgroup.splice( nOrder, 0, tomove);
                // rescan dah .. 
                for(var i=0; i<gvar.smgroup.length; i++)
                  if(gvar.smgroup[i]) newGrup.push(gvar.smgroup[i]);
                gvar.smgroup = newGrup;
                //return;
              }
            }

            // good togo
            var ch_grup, tmp_SML = {}, grlen, degrup, joined;
            getValue(KS + 'CUSTOM_SMILEY', function( _CS ){
              var curOrder, curG, cparts = (_CS ? _CS.split('<!>') : []), cprL = cparts.length;
              if( cprL ) for(var n=0; n<cprL; n++ ){
                part = cparts[n].split('<!!>');
                tmp_SML[ String(part[0]) ] = String( part[1] );
              }
              grlen = (gvar.smgroup ? gvar.smgroup.length : 0);
              
              
              if( todo == 'edit' ){
                curOrder = $('#current_order').val();
                curG = [(curOrder ? curOrder : ""), $('#current_grup').val()];
                ch_grup=(curG[1]!='' && grupname!='' && grupname!=curG[1] );
                
                for(var k=0; k<grlen; k++ ){
                  degrup = gvar.smgroup[k].toString();
                  if( degrup==curG[1] ){
                    if( todel ){
                      grupname = false;
                    }else{
                      tmp_SML[ degrup ] = niubuf.toString();
                      grupname = trimStr( ch_grup ? cleanGrup() : curG[1] ).replace(/\!/g,'\\!');
                    }
                  }else{
                    grupname = degrup;
                  }
                  ret+=(grupname ? grupname.toString()+'<!!>'+tmp_SML[degrup]+( (k+1) < grlen ? '<!>':'') : '');
                }
                // end for
              }
              else{
                joined = false;
                if(gvar.smgroup) for(var k=0; k<grlen; k++){
                  degrup = gvar.smgroup[k].toString();
                  joined=joined || ( degrup==grupname );
                  ret+= degrup+'<!!>'+tmp_SML[ degrup ] +(joined ? niubuf.toString():'') + ( (k+1) < grlen ? '<!>':'');
                }
                if(!joined) ret+='<!>'+ grupname.toString() +'<!!>'+ niubuf.toString();
              }
              _SML_.save_scustom(ret)
            });
          })(niubuf, todel);
          // end remixBuff
        }
      }
      else if(task=='manage'){

        $(this).text('Save');
        $('label_group').text('Group');
        $('#scustom_todo').val('edit');
        $('#manage_help, #manage_cancel, #custom_bottom, #custom_addgroup_container, #dv_menu_disabler, #position_group, #delete_grupname', $boxSM)
          .removeClass("hide");
        $('#scustom_container, #title_group', $boxSM)
          .addClass("hide");
        
        var gid, grupname = $('#current_grup').val(), buff_edit='';
        $('#input_grupname').val( grupname );
        gid = $('#current_order').val();
        // pos_group_sets
        $('#pos_group_sets option[value='+gid+']').attr('selected', 'selected');
        
        getValue(KS + 'CUSTOM_SMILEY', function(retcs){
          var part, cparts = retcs.split('<!>'), cprL = cparts.length;
          for(var n=0; n<cprL; n++){
            part = cparts[n].split('<!!>');
            if( grupname==part[0] )
              buff_edit = unescape( String( part[1] ).replace(/,/g, '\n').replace(/{sctag\:br}/g, '') );
          }
          $('#textarea_scustom_container').val( buff_edit );
          $('#input_grupname').focus();
        });
      }
      do_an_e(e);
      return !1;
    });
    
    $boxSM.find('#delete_grupname').click(function(){
      var cGrp = $('#current_grup').val();
      if( confirm('You are about to delete this Group.\n'+'Name: '+cGrp+'\n\nContinue delete this group?\n') ){
        $('#scustom_todel').val( cGrp );
        do_click($('#manage_btn').get(0));
      }
    });
    
    $boxSM.find('#textarea_scustom_container, #delete_grupname, #manage_help').keydown(function(ev){
      var land_id, tid, A = ev.keyCode || ev.keyChar;
      tid = $(this).attr('id');
      if( tid=='manage_help' ){
        if( $('#pos_group_sets').is(':visible') )
          return true;
        else
          land_id = '#input_grupname';
      }else{
        land_id = (tid == 'delete_grupname' ? '#input_grupname' : '#manage_btn');
      }
      
      if(A === 9){
        do_an_e(ev);
        gvar.$w.setTimeout(function(){ $(land_id).focus() }, 50);
      }
    });
    
    _SML_.event_menus();
  },
  

  event_img: function(tgt, label){
    var $boxSM = $("#"+gvar.qID).find("."+_SML_.self);

    $boxSM.find(tgt + ' img, '+tgt+' span').each(function(){
      $(this).click(function(){
        do_smile( $(this) )
      })
    });

    _SML_.setClassEvents(label);
  },
  setClassEvents: function(label){
    var tabs = ['tkecil', 'tbesar', 'tcustom'], tL = tabs.length;
    var $boxSM = $("#"+gvar.qID).find("."+_SML_.self);
    for(var i=0; i<tL; i++)
      $boxSM.removeClass('events-' + tabs[i]);
    $boxSM.addClass('events-'+label);
  },

  refresh_menus: function(){
    $('#ul_group').html( _SML_.menus_scustom() );
    _SML_.event_menus();
  },
  load_smiley: function(target){
    if( !gvar.smbesar || !gvar.smkecil || !gvar.smkplus || !gvar.smcustom )
      rSRC.getSmileySet();

    clog("load_smiley");

    // shorthand for .XKQR wrapper
    var $tgt, $XK = $("#"+gvar.qID);
    var $boxSM = $XK.find("."+_SML_.self);

    if( !target ) 
      target = '#tkecil';
    $tgt = $(target);

    
    if( !$tgt.hasClass('filled') ){
    
      var smilies, tpl='',
          label = target.replace('#', ''),
          smilies_segments = {},
          bulksmilies = [gvar.smkecil, gvar.smbesar, gvar.smkplus]
      ;
      for(var i=0, iL=bulksmilies.length; i<iL; i++){
        var smlset = bulksmilies[i],
            keyName = "t"+smlset.name,
            itemLabel, lastIndex
        ;
        smilies_segments[keyName] = [];
        if( smlset.labels && smlset.labels.length ){

          for(var j=0, jL=smlset.labels.length; j<jL; j++ ){
            itemLabel = {
              label: smlset.labels[j].label
            };
            if( smlset.labels[j].offset ){
              itemLabel.index = 0;
              itemLabel.n = smlset.labels[j].offset;
              lastIndex = itemLabel.n;
            }
            else{
              if( lastIndex )
                itemLabel.index = lastIndex;
            }
            smilies_segments[keyName].push( itemLabel );
          }
        }
        else if( smlset.label ){
          smilies_segments[keyName].push({
            label: smlset.label
          });
        }
      }

      switch( label ){
        case "tkecil":
          smilies = (gvar.smkecil && gvar.smkecil.smilies ? gvar.smkecil.smilies : null);
          break;
        case "tbesar":
          smilies = (gvar.smbesar && gvar.smbesar.smilies ? gvar.smbesar.smilies : null);
          break;
        case "tkplus":
          smilies = (gvar.smkplus && gvar.smkplus.smilies ? gvar.smkplus.smilies : null);
          break;
        default:
          smilies = gvar.smcustom;
          break;
      }
      
      gvar.sTryLoadSmilies = gvar.$w.setTimeout(function(){
        if( target != '#tcustom' ){
          var tmp_smilies, segment;
          segment = ('undefined' != typeof smilies_segments[label] && smilies_segments[label] ? smilies_segments[label] : null);

          if( segment && smilies ){

            tmp_smilies = smilies;
            for(var j=0, jL=segment.length; j<jL; j++){
              tpl += '<div class="bbsection"><strong>'+segment[j]['label']+(target == '#tkplus' && gvar.settings.kaskusplus_bbcode_img ? ' <div class="kplus-bbhelp" title="Smiley Shortcode is only for KASKUS Plus Membership">&mdash;BBCode-Mode <i class="stage stage-help"></i></div>':'')+'</strong></div>';
              smilies = tmp_smilies.slice(parseFloat(segment[j]['index']), (segment[j]['n'] ? parseFloat(segment[j]['n']) : undefined));
              $.each(smilies, function(i, img){

                tpl+= '<img '+(target=='#tkplus' ? ' data-kplus="1"':'')+' src="'+img[0]+'" alt="'+ img[1] +'" title="'+ img[1] + ' &#8212;' + img[2] +'" /> '
              });
            }
          }
          else{
            // failover
            $.each(smilies, function(i, img){

              tpl+= '<img '+(target=='#tkplus' ? ' data-kplus="1"':'')+' src="'+img[0]+'" alt="'+ img[1] +'" title="'+ img[1] + ' &#8212;' + img[2] +'" /> '
            });
          }

          if( target == '#tkplus' ){
            tpl += ''
              +'<div class="help-kplus">'
              +'<a href="'+gvar.domain+'miscellaneous/donatur/?ref=kqr-script&amp;med=k-plus" target="_blank">Emoticon Kaskus Plus tidak muncul?</a>'
              +'</div>';

            clog(tpl);
          }

          // attach-html
          $tgt.html( tpl );
          _SML_.event_img(target, label);
        }else{
          // custom-smiley

          _SML_.init_scustom(target, smilies);
          _SML_.event_scustom();
          do_click($('#tbgrup_0').get(0));
        }

        if( $tgt.html != '' )
          $tgt.addClass('filled');
        _SML_.switch_tab( target );

        gvar.sTryLoadSmilies && 
          clearTimeout( gvar.sTryLoadSmilies );
      }, 1);
      // klo dah keload semua termuat in DOM
    }else{
      // sumthin like switch only
      _SML_.switch_tab( target );
    }
  },
  switch_tab: function(target){
    var $tgt, $boxSM = $("#"+gvar.qID).find("."+_SML_.self);
    $tgt = $(target);

    if( !$tgt.html() ){
      _SML_.load_smiley(target);
      return;
    }
    $tgt.addClass('active').show();
  },
  set_tabfirst: function(type){
    var $tgt, $parNav = $(".fg-box-bottom .box-smiley .nav.nav-tabs");
    var current_first = $parNav.find("li").first().find(">a").attr("href").replace("#t");
    if( current_first == type ) return;

    $tgt = $parNav.find("a[href='#t"+type+"']");
    if( $tgt.length )
      $parNav.prepend( $tgt.parent() )
  },
  toggletab: function(doshow){
    var $tgt, $XK = $("#"+gvar.qID);
    var bs = '.'+_SML_.self,
      bb = '.box-bottom';

    if( doshow ){
      $XK.find(bs + ', ' + bb).show();
      $XK.find('.'+_SML_.sibl).hide();

      $tgt = $XK.find(".nav.nav-tabs > li.active");
      if( $tgt.get(0) )
        do_click( $tgt.find("a").get(0) );
      else
        do_click( $XK.find(".nav.nav-tabs > li > a").first().get(0) );
    }else{
      $XK.find(bs + ', ' + bb).hide();
    }
  }
};


/*
* object urusan settings
* design s/d events & reset-settings
*/
var _STG = {
  e:{
     dialogname: 'qr-modalBoxFaderLayer'
    ,boxsetting: 'modal_setting_box'
  },
  init:function(){
    close_popup();
    $('body.forum').addClass('hideflow');
    _STG.main();
  },
  main:function(){
    $('#'+_STG.e.dialogname)
      .css('visibility', 'visible')
      .show();

    $('body').prepend( rSRC.getDialog("TPLSettingDialog") );
    
    _STG.design();
    
    myfadeIn( $('#'+_STG.e.boxsetting), 130, function(){
      _STG.event_main()
    });   
    resize_popup_container(720);
  },
  design:function(){
    swapCol();

    var mnus, mL, idx=0, tpl = '';
    var $box_setting = $('#qr-box_setting');
    mnus = {
       gen:  ['General', rSRC._TPLSettingGeneral()]
      ,exim: ['Export \/ Import', rSRC._TPLSettingExim()]
      ,kbs:  ['Keyboard Shortcut', rSRC._TPLSettingShortcut()]
      ,abt:  ['About', rSRC._TPLSettingAbout()]
    };
    mL = 4; // n tab menus
    tpl='<ul id="ul_group" class="qrset_mnu settingmnu">'
    $box_setting.find('.cs_right').html('');
    for(tipe in mnus){
      if(typeof tipe!='string') continue;
      
      tpl+= '<li data-ref="'+tipe+'" class="qrt'+(idx==0 ? ' curent': (idx==(mL-1) ? ' qrset_lasttab' : '')) +'"><div>'+mnus[tipe][0]+'</div></li>';
      $box_setting.find('.cs_right')
        .append('<div class="stg_content'+(idx==0 ? ' isopen':'')+'" id="stg_content_'+tipe+'" style="display:none;">'+ (mnus[tipe][1] ? mnus[tipe][1] : '') +'</div>');
      idx++;
    }
    tpl+='</ul>';
    $box_setting.find('.cs_left').html( tpl );
    $box_setting.find('.st_contributor').scrollTop(0);
    $('#modal_setting_box .modal-dialog-title-text').css('left', '0');
    setTimeout(function(){
      var wtreshold = 5;
      $box_setting = $('#qr-box_setting');
      $box_setting.find('.cs_right')
        .css('width', ( $box_setting.width()-$box_setting.find('.cs_left').width()+wtreshold)+'px')
        .css('min-height', $box_setting.find(".cs_left").height()+'px')
        .removeClass("hide")
      ;
    }, 123);
  },
  event_main:function(){
    var $box = $('#modal_setting_box');

    // menus
    $box.find('.qrt').each(function(){
      $(this).click(function(){
        var $btn, $tgt,
          $me = $(this),
          tipe = $me.attr('data-ref'),
          disb, par;
        par = $(this).parent();
        $box.find('.isopen').removeClass('isopen').hide();
        $tgt = $('#stg_content_' + tipe);
        $tgt.addClass('isopen').show();
        $tgt.parent().attr("data-tab", tipe);
        $me.parent().find('.curent').removeClass('curent');
        $me.addClass('curent');
        $('#box_preview_subtitle').html( ' ' + '&#187; ' +  $(this).find('div').html() );
        
        disb = 'goog-btn-disabled';
        $btn = $('#box_action');
        $btn.html('Save');
        if(tipe == 'exim'){
          if( !$box.find('#textarea_rawdata').val() )
            _STG.load_rawsetting();
          $btn.html('Import').removeClass(disb).attr('data-act', 'import');
        }else if(tipe == 'gen'){
          $btn.removeClass(disb).attr('data-act', 'update');
        }else{
          $btn.addClass(disb).attr('data-act', 'none');
        }
        $btn.attr('data-todo', tipe);
      });
    });
    $box.find('.optchk').each(function(){
      $(this).click(function(){
        var $tgt, chked, $me = $(this), id = $me.attr('id');
        chked = $me.is(':checked');
        $tgt = $me.closest('.stg_content').find('#'+id + '_child');

        if( $tgt.length ) {
          $tgt[chked ? 'removeClass' : 'addClass']("hide");
          
          if(id == 'misc_autolayout'){
            $box.find('#edit_tpl_cancel').css('display', chked ? '' : 'none' );
            chked && $box.find('#edit_tpl_txta').focus().select();
          }
        }
      });
    });
    $box.find('#edit_tpl_cancel').click(function(){
      var $miscauto = $box.find('#misc_autolayout');
      do_click( $miscauto.get(0) );
      $miscauto.removeAttr('checked');
    });
    $box.find('#misc_elastic_editor').click(function(){
      var $me = $(this);
      var $par = $me.closest("#tabs-itemstg-general");
      var $tgt = $par.find(".fg-fixed_toolbar");
      if( $me.is(":checked") )
        $tgt.removeClass("hide");
      else
        $tgt.addClass("hide");
    });
    $box.find('.goog-tab').each(function(){
      $(this).click(function(){
        var $me = $(this),
          $par = $me.closest(".form-group"),
          target = $me.attr("data-target");
        $par.find('.goog-tab-selected').removeClass('goog-tab-selected');
        $par.find('.itemtabcon').removeClass('active');
        $me.addClass('goog-tab-selected');
        $par.find('#'+target).addClass('active');
      });
    });

    $box.find('#misc_smiley_kplus').click(function(){
      var $me = $(this), $tgtkplus = $box.find(".kplus_first");
      if( $me.is(":checked") )
        $tgtkplus.removeClass('hide');
      else
        $tgtkplus.addClass('hide');
    });

    if( !gvar.noCrossDomain ) {// unavailable on some browser T_T
      $box.find('#chk_upd_now').click(function(){
        $box.find('#chk_upd_load').show();
        $(this).hide();
        _UPD.caller = '#' + $(this).attr('id');
        _UPD.check(true);
      })
    }

    $box.find('#chk_upd_smilies').click(function(){
      var $me = $(this);

      // restore it from: data-deftext
      $me
        .prop('disabled', true)
        .addClass('goog-btn-disabled')
        .text('Updating...')
        .blur()
      ;
      _UPD_SMILIES.caller = '#' + $me.attr('id');

      // git it a break a lil
      setTimeout(function(){
        _UPD_SMILIES.run(function(smiley_bulk_){
          
          clog('lastupdate: '+smiley_bulk_.lastupdate)
          // tpl: X smilies, updated: <DATE>
          var counter = 0, updText = '',
              smilies = (smiley_bulk_.ksk_smiley ? smiley_bulk_.ksk_smiley : null),
              $tgt = $(".last-update-smilies")
          ;

          if( smilies )
          for(var field in smilies)
            counter += smilies[field]['smilies'].length;

          updText = ''
            +counter+' smilies, '
            +'updated: '+(smiley_bulk_.lastupdate ? getHumanDate( parseFloat(smiley_bulk_.lastupdate) ) : 'n/a')
          ;
          $tgt.text( updText );
        });
      }, 567);
    })
    
    var val, pval, isChk = function(x){ return $box.find(x).is(':checked') };
    $box.find('#box_action').click(function(){
      var $me = $(this);
      var $inner_setting = $box.find('#tabs-contentstg-inner');

      // general setting
      if( $me.attr('data-act') == 'update' ){
        var misc, reserved_CSA, tpltext, errMsg='', isError = 0;

        var restore_save = function(){
          $me.text('Save').removeClass('goog-btn-disabled');
          return false;
        };
        
        // box_action
        $me
          .text('Saving..')
          .addClass('goog-btn-disabled');

        // validate
        pval = ( isChk('#misc_autolayout') ? '1' : '0' );
        tpltext = trimStr( $box.find('#edit_tpl_txta').val().toString() );
        if( tpltext == "" )
          tpltext = '[B]{message}[/B]';

        if( pval && tpltext.toLowerCase().indexOf('{message}') != -1 ){
          gvar.settings.userLayout.config = ('0,' + pval).toString();
          setValueForId(gvar.user.id, gvar.settings.userLayout.config, 'LAYOUT_CONFIG'); //save layout
          gvar.settings.userLayout.template = val = tpltext;
          setValueForId( gvar.user.id, encodeURIComponent(val), 'LAYOUT_TPL', ['<!>','::'] );
        }else{
          isError = 1;
          errMsg = 'Invalid Layout format.\nCan\'t find "{message}" in template.\n\neg. [B]{message}[/B]';
        }
        
        if( isError && pval ){
          alert(errMsg);
          return restore_save();
        }
        
        // =============
        
        // QR_HOTKEY_KEY QR_HOTKEY_CHAR
        var oL, value, el, Chr;
        if( isChk( '#misc_hotkey' ) ){
          misc = 'misc_hotkey_ctrl,misc_hotkey_shift,misc_hotkey_alt'.split(',');
          reserved_CSA = [(!gvar.isOpera ? '0,0,1' : '1,0,1'), '1,1,0']; /* Alt+Q OR Ctrl+Alt+Q -- Ctrl+Shift+Q */
          oL = misc.length;
          value = [];
          for(var id=0; id<oL; id++){
            if( !isString(misc[id]) ) continue;
            value.push( isChk( '#'+misc[id] ) ? '1' : '0' );
          }
          Chr = $box.find('#misc_hotkey_char').val().toUpperCase();
          if( Chr=='Q' && (reserved_CSA[0]==String( value ) || reserved_CSA[1]==String( value )) ){ // bentrok        
            if( confirm('Hotkey is already reserved:\n ['+(!gvar.isOpera ? 'Alt + Q':'Ctrl + Alt +Q')+'] : Fetch Quoted Post\n [Ctrl + Shift + Q] : Deselect Quote\n\nDo you want to make a correction?') )
              return restore_save();
          }
        }else{
          Chr = '';
          value = ['0,0,0'];
        }

        if( Chr.length==0 || (Chr && Chr.match(/[A-Z0-9]{1}/)) ){
          gvar.settings.hotkeykey = String( value );
          gvar.settings.hotkeychar = String( Chr );
          
          setValue(KS+'QR_HOTKEY_KEY', String( value ), function(){
            setValue(KS+'QR_HOTKEY_CHAR', String( Chr ));
          });
        }


        // -=-=-=-=-=-=-=-=-=-
        // smilies-tab-thingie
        misc = 'kecil,besar,custom'.split(',');
        // recent? > add item:  misc.push("recent")

        // KASKUS_PLUS | gvar.settings.show_kaskusplus
        value = (isChk( '#misc_smiley_kplus' ) ? '1' : '0');
        setValue(KS+'SHOW_KASKUS_PLUS', String( value ));
        gvar.settings.show_kaskusplus = (value == '1' ? true : false);
        if( gvar.settings.show_kaskusplus )
          misc.push('kplus');
        
        // autoload smiley
        value = [];
        value.push( isChk( '#misc_autoshow_smile' ) ? '1' : '0' );
        value.push( $inner_setting.find("[name='aus']:checked").val() );
        if( misc.indexOf(value[1]) === -1 )
          value[1] = 'kecil';
        setValue(KS+'SHOW_SMILE', String( value ));

        // autocomplete smiley
        value = [];
        if( $inner_setting.find("[name='auc']:checked").length ){
          value.push( isChk( '#misc_smiley_autocomplete' ) ? '1' : '0' );
          $inner_setting.find("[name='auc']:checked").each(function(){
            var val_ = $(this).val();
            if( misc.indexOf(val_) !== -1 )
              value.push( val_ );
          });
        }else{
          value.push('0');
        }
        setValue(KS+'AUTOCOMPLETE_SML', String( value ));

        // tabfirst_smile
        value = '';
        value = $inner_setting.find("[name='ftab']:checked").val();
        if( misc.indexOf(value) === -1 )
          value = 'kecil';
        setValue(KS+'TABFIRST_SMILE', String( value ));
        gvar.settings.tabfirst_smiley = value;
        _SML_.set_tabfirst( gvar.settings.tabfirst_smiley );


        // TXTCOUNTER
        value = (isChk( '#misc_txtcount' ) ? '1' : '0');
        setValue(KS+'TXTCOUNTER', String( value ));
        gvar.settings.txtcount = (value == '1' ? true : false);
        $('.counter')[gvar.settings.txtcount ? 'show':'hide']();



        // ELASTIC_EDITOR
        value = (isChk( '#misc_elastic_editor' ) ? '1' : '0');
        setValue(KS+'ELASTIC_EDITOR', String( value ));
        gvar.settings.elastic_editor = (value == '1' ? true : false);
        _TEXT.setElastic(null, true);

        // FIXED_TOOLBAR
        if( gvar.settings.elastic_editor )
          $box.find('#misc_fixed_toolbar').prop("checked", true);
        else
          $box.find('#misc_fixed_toolbar').prop("checked", false);
        value = (isChk( '#misc_fixed_toolbar' ) ? '1' : '0');
        setValue(KS+'FIXED_TOOLBAR', String( value ));
        gvar.settings.fixed_toolbar = (value == '1' ? true : false);

        // SCUSTOM_NOPARSE
        value = (isChk( '#misc_scustom_noparse' ) ? '1' : '0');
        setValue(KS+'SCUSTOM_NOPARSE', String( value ));
        gvar.settings.scustom_noparse = (value == '1' ? true : false);

        // IMGBBCODE_KASKUS_PLUS   
        value = (isChk( '#misc_smiley_kplus_bbcode_img' ) ? '1' : '0');   
        setValue(KS+'IMGBBCODE_KASKUS_PLUS', String( value ));    
        gvar.settings.kaskusplus_bbcode_img = (value == '1' ? true : false);


        // THEME_FIXUP
        value = $box.find('#misc_theme_fixups').val();
        if( ['centered','c1024px','fullwidth'].indexOf(value) == -1 )
          value = '';
        setValue(KS+'THEME_FIXUP', String( value ));
        gvar.settings.theme_fixups = value;
        set_theme_fixups();

        // HIDE_GREYLINK
        value = (isChk( '#misc_hide_greylink' ) ? '1' : '0');
        setValue(KS+'HIDE_GREYLINK', String( value ));
        gvar.settings.hide_greylink = (value == '1' ? true : false);
        $('body')[gvar.settings.hide_greylink ? 'addClass':'removeClass']('kqr-nogreylink')

        // ALWAYS_NOTIFY
        value = (isChk( '#misc_always_notify' ) ? '1' : '0');
        setValue(KS+'ALWAYS_NOTIFY', String( value ));
        gvar.settings.always_notify = (value == '1' ? true : false);

        
        // last shot
        gvar.$w.setTimeout(function(){
          // save instant/autocorrect 
          pval = (isChk( '#misc_updates' ) ? '1' : '0');
          setValue(KS+'UPDATES', pval.toString(), function(){
            val = $box.find('#misc_updates_interval').val();
            val = ( isNaN(val)||val <= 0 ? 1 : (val > 99 ? 99 : val) );
            setValue(KS+'UPDATES_INTERVAL', val.toString(), function(){

              // reload settings; make sure im the last to save
              gvar.$w.setTimeout(function(){
                getSettings( gvar.settings );
                _STG.cold_boot();

                do_click( $box.find('#box_cancel').get(0) );
              }, 200);
            });
          });
        }, 400);
      } //=end act update
      
      // export/import setting==
      else{
        var rL, raw, btn='#box_action', tgt = '#textarea_rawdata', disb = 'goog-btn-disabled';
        $(tgt).addClass(disb);
        raw = trimStr( $(tgt).val() );
        
        if( gvar.buftxt && raw == trimStr(gvar.buftxt) ){
          $box.find(btn).val('Nothing changed..');
          if( gvar.buftxt )
            delete( gvar.buftxt );

          window.setTimeout(function(){

            do_click( $box.find('#box_cancel').get(0) );
          }, 750);
        }
        else{
          if( !confirm(''
              +'Are you sure to update these settings?'+'\n'
              +'Your current settings will be lost.'+'\n\n'
              +'Page may need to reload to apply new Settings.'+'\n') ){
            $box.find(tgt).removeClass(disb);
            return;
          }else{
          
            $box.find(btn).val('Saving..');
            raw = raw.split('\n'), rL = raw.length;
            var cucok, lastkey = false, line = 0;
            var uplkeys = ['UPLOAD_LOG'];
            
            var query_save_setting = function(line){
              var newval = trimStr( raw[line] );
              if( cucok = newval.match(/^\[([^\]]+)]/) ){
                // is this a defined key?
                cucok[1] = trimStr(cucok[1]);
                lastkey = ( isDefined(OPTIONS_BOX[KS + cucok[1]]) ? cucok[1] : false ); // only allow registered key
              
              }else if( lastkey && newval && !newval.match(/^\#\s(?:\w.+)*/) ){
                if( uplkeys.indexOf(lastkey) !== -1 )
                  newval = entity_encode( newval.toString() )
                            .replace(/\"/g, '&quot;')
                            .replace(/\'/g, '&apos;')
                          ;

                // is lastkey is defined, newval is not blank and is not a komeng
                try{
                  setValue(KS+lastkey, newval.toString(), function(){
                    // flushed, find next key
                    lastkey = false;
                  });
                }catch(e){};
              }
              line++;

              if(line < rL){
                query_save_setting(line);

              }else{
                // done ...
                gvar.$w.setTimeout(function(){
                  getSettings( gvar.settings );
                  gvar.$w.setTimeout(function(){ location.reload(false) }, 50);
                }, 200);
              }
            };
            // let's save em all
            query_save_setting(line);
          }
        }
      }
    });
    
    $box.find('#exim_select_all').click(function(){
      var $txaraw = $box.find('#textarea_rawdata');
      $txaraw.focus();
      selectAll( $txaraw.get(0) );
    });
    
    $box.find('#reset_settings').click(function(){

      _STG.reset_settings()
    });
    
    $('#box_cancel, .modal-dialog-main .kqr-icon-close').click(function(){

      close_popup()
    });
    
    do_click( $box.find('.curent').get(0) );
    $('#'+gvar.tID).blur();
  },
  cold_boot: function(){
    var cscontainer = 'tcustom';
    if( $('#'+cscontainer).get(0) && !$('#'+cscontainer).html() )
      return;

    gvar.smcustom = null;
    $('#'+cscontainer).html();
    _SML_.load_smiley( cscontainer );
  },
  load_rawsetting: function(){
    // collect all settings from storage,. 
    var keys  = [
       'UPDATES','UPDATES_INTERVAL','SHOW_KASKUS_PLUS'
      ,'QR_HOTKEY_KEY','QR_HOTKEY_CHAR','QR_DRAFT'
      ,'TXTCOUNTER','ELASTIC_EDITOR','FIXED_TOOLBAR','THEME_FIXUP','HIDE_GREYLINK','ALWAYS_NOTIFY'
      ,'SHOW_SMILE','TABFIRST_SMILE','AUTOCOMPLETE_SML','LAYOUT_CONFIG','LAYOUT_TPL','SCUSTOM_NOPARSE','CUSTOM_SMILEY'
      ,'IMGBBCODE_KASKUS_PLUS'
    ];
    var keykomeng = {
       'UPDATES':'Check Update enabled? validValue=[1,0]'
      ,'UPDATES_INTERVAL':'Check update Interval (day); validValue=[0< interval < 99]'
      ,'QR_DRAFT':'Mode QR-Draft; validValue=[1,0]'
      ,'TXTCOUNTER':'Mode Text Couter; validValue=[1,0]'
      ,'ELASTIC_EDITOR':'Keep editor in elastic mode; validValue=[1,0]'
      ,'FIXED_TOOLBAR':'Auto Fixed toolbar; validValue=[1,0]'
      ,'THEME_FIXUP':'Theme Fixed thread; validValue=[centered,c1024px,fullwidth]'
      ,'HIDE_GREYLINK':'Hide grey origin link; validValue=[1,0]'
      ,'ALWAYS_NOTIFY':'Trigger Notification of Quoted Post; validValue=[1,0]'
      ,'SHOW_SMILE':'Autoload smiley; [isEnable,smileytype]; validValue1=[1,0]; validValue2=[kecil,besar,custom]'
      ,'TABFIRST_SMILE':'Set First Tab on smilies boxset; validValue=[kecil,besar,custom]'
      ,'AUTOCOMPLETE_SML':'Auto Complete smiley; [isEnable,smiletype,..] validValue1=[1,0]; validValue2=[kecil,besar,kplus]'
      ,'QR_HOTKEY_KEY':'Key of QR-Hotkey; [Ctrl,Shift,Alt]; validValue=[1,0]'
      ,'QR_HOTKEY_CHAR':'Char of QR-Hotkey; validValue=[A-Z0-9]'
      ,'LAYOUT_CONFIG':'Layout Config; [userid=isNaN,isEnable_autoLAYOUT]; isEnable\'s validValue=[1,0]'
      ,'LAYOUT_TPL':'Layout Template; [userid=LAYOUT]; validValue of LAYOUT is must contain escaped {MESSAGE}'
      ,'SHOW_KASKUS_PLUS':'Show Kaskus Plus Smilies; validValue=[1,0]'
      ,'SCUSTOM_NOPARSE':'Smiley Custom Tags will not be parsed; validValue=[1,0]'
      ,'CUSTOM_SMILEY':'Smiley Custom\'s Raw-Data; [tagname|smileylink]'
      ,'IMGBBCODE_KASKUS_PLUS':'Use IMG BBCode for Kaskus Plus Smilies; validValue=[1,0]'
    };
    
    var uplkeys = ['UPLOAD_LOG'];
    var uplkeys_komeng = {
      UPLOAD_LOG:'Kaskus Uploader Log'
    };
    
    var z, nn, kL=keys.length;
    var parse_UA_Vers = function(){
      return ( window.navigator.userAgent.replace(/\s*\((?:[^\)]+).\s*/g,' ').replace(/\//g,'-') );
    };
    nn = '\n'; 
    gvar.buftxt = '# QR-Settings Raw-Data'+'\n';
    gvar.buftxt+= '# Version: QR '+gvar.sversion+'\n';
    gvar.buftxt+= '# Source: https://'+ 'greasyfork.org/scripts/'+gvar.scriptMeta.scriptID_GF+'\n';
    gvar.buftxt+= '# User-Agent: '+parse_UA_Vers()+'\n';
    gvar.buftxt+= '# Date-Taken: '+getHumanDate()+'\n';
    gvar.buftxt+= nn;
    
    // append uploader log
    var query_uploaderlog = function(x){
      getValue(KS + uplkeys[x], function(ret){
        var cur_key = uplkeys[x];
        if( ret && cur_key ){
          gvar.buftxt+= '# '+uplkeys_komeng[cur_key] + nn;
          gvar.buftxt+= '[' + cur_key + ']' + nn + ret + nn + nn;
        }
        if( (x+1) < kL ){
          x++;
          query_uploaderlog( x );
        }
      });
    };

    var query_settings = function(z){
      getValue(KS + keys[z], function(ret){
        var cur_key = keys[z];
        if( ret && cur_key ){
          gvar.buftxt+= '# '+keykomeng[cur_key] + nn;
          gvar.buftxt+= '[' + cur_key + ']' + nn + ret + nn + nn;
        }
        if( (z+1) < kL ){
          z++;
          query_settings( z );
        }else{
          // switch to uploader
          kL = uplkeys.length;
          query_uploaderlog(0);

          gvar.$w.setTimeout(function(){
            $('#textarea_rawdata').val( gvar.buftxt ).removeAttr('readonly');
          }, 200);
        }
      });
    };
    z = 0;
    query_settings( 0 );
  },
  reset_settings: function(silent, cb){
    getValue(KS+'CUSTOM_SMILEY', function(ret){
      var msg, prmpt, space, csmiley, keys, yakin,
        home=[gvar.kask_domain+'hCZmM','https://greasyfork.org/scripts/'+gvar.scriptMeta.scriptID_GF+'/feedback'];

      space = '';
      for(var i=0;i<20;i++) space+=' ';
      csmiley = ret.replace(/^\s+|\n|\s+$/g, "");
      msg = ( csmiley!="" ? 
        HtmlUnicodeDecode('&#182;') + ' ::Alert::\nCustom Smiley detected. You might consider of losing it.\n\n' : ""
      )
      +'This will delete/reset all saved data.'
      +'\nPlease report any bug or some bad side effects here:'+space+'\n'+home[1]+'\nor\n'+home[0] + '\n\n'
      + HtmlUnicodeDecode('&#187;')+' Continue with Reset?';

      prmpt = (!("undefined" != typeof silent && silent) ? confirm(msg) : true);
      if( prmpt ){
        keys = [
           'LAST_UPLOADER'
          ,'UPDATES_INTERVAL','UPDATES','TXT_COUNTER'
          ,'QUICK_QUOTE','CUSTOM_SMILEY','TMP_TEXT'
          ,'QR_HOTKEY_KEY','QR_HOTKEY_CHAR', 'QR_DRAFT'
          ,'LAYOUT_CONFIG','LAYOUT_TPL'
          ,'QR_LastUpdate'
          ,'UPLOAD_LOG','SMILIES_BULK','CSS_BULK','CSS_META','SCUSTOM_NOPARSE'
          ,'TXTCOUNTER','ELASTIC_EDITOR','FIXED_TOOLBAR','THEME_FIXUP'
          ,'HIDE_GREYLINK','ALWAYS_NOTIFY'
          ,'SHOW_SMILE','TABFIRST_SMILE','AUTOCOMPLETE_SML'
          ,'SHOW_KASKUS_PLUS','IMGBBCODE_KASKUS_PLUS'
        ];
        var kL=keys.length, waitfordel, alldone=0;
        for(var i=0; i<kL; i++){
          try{
            if( isString(keys[i]) )
              delValue(KS + keys[i], function(){
                alldone++;
                if( alldone >= kL ){
                  gvar.$w.setTimeout(function() { location.reload(false); }, 500);
                }
              });
          }catch(e){}
        }
      }
    })
  }
};

var _UPD_SMILIES = {
  caller: null,
  dialog: function(doshow, msg){
    var dialogId = 'sml_' + String(gvar.scriptMeta.timestamp);
    _UPD_SMILIES.DialogId = dialogId;

    if( dialogId && !$('#'+dialogId).length ){

      $('body').append( rSRC.getAlert(dialogId, doshow, msg) );
      $('#'+dialogId).find('.close').click(function(){
        _UPD_SMILIES.dialog_dismiss();
      });
    }
  },
  dialog_dismiss: function(xfade){
    var dialogId = _UPD_SMILIES.DialogId;
    !xfade && (xfade = 222);
    $('#'+dialogId).length && $('#'+dialogId).fadeOut(xfade, function(){
      $(this).remove();
    });
  },
  check: function( cb ){
    clog("inside check update smilies...");
    var url = gvar.getsmilies_url,
        Buckets = {
          kplus: {smilies: []},
          kecil: {smilies: []},
          besar: {smilies: []}
        },
        // identify smilies mapping in new Buckets category 
        // compare text dom matching w/ regex [match, unmatch]
        match_map = [
          {
            match: 'Plus',
            name: 'kplus',
          },
          {
            match: 'small',
            name: 'kecil',
          },
          {
            match: 'Standart',
            name: 'kecil',
          },
          {
            match: 'Only in',
            unmatch: 'small',
            name: 'besar',
          }
        ]
    ;

    $.get(url, function(ret){
      var $page, nItem, isTH,
          $caller = (_UPD_SMILIES.caller ? $(_UPD_SMILIES.caller) : null)
      ;

      if( $caller && $caller.length )
        $caller
          .prop("disabled", false)
          .removeClass("goog-btn-disabled")
          .text( $caller.attr('data-deftext') )
        ;

      if( ret ){
        $page = $( ret ).find("#smilietable");
        nItem = $page.find("img").length;
        clog("Found "+nItem+" images");
        if( nItem > 0 ){
          var last_bucket_name, iTr=0;

          $page.find("tr").each(function(){
            var $tr = $(this), $isTH, $imgs, $th, lastText;
            $isTH = $tr.find(">th");
            if( $isTH.length > 0 ){
              $th = $isTH.first();
              lastText = $th.text();
              clog("collecting head of: "+lastText);
              // find-match bucket
              for(var b=0, bL=match_map.length; b<bL; b++){
                var regx = new RegExp(match_map[b]['match']),
                    regx_unmatch = (match_map[b]['unmatch'] ? new RegExp(match_map[b]['unmatch']) : null)
                ;
                if( regx_unmatch !== null )
                  regx_unmatch = !regx_unmatch.test(lastText)
                else
                  regx_unmatch = true;

                if( regx.test(lastText) && regx_unmatch && 'undefined' != typeof Buckets[match_map[b]['name']] ){
                  last_bucket_name = match_map[b]['name'];

                  if( 'undefined' != typeof Buckets[last_bucket_name]['labels'] ){
                    Buckets[match_map[b]['name']]['labels'].push({
                      label: lastText,
                      offset: iTr
                    });
                  }
                  else if( 'undefined' == typeof Buckets[last_bucket_name]['label'] ){
                    Buckets[last_bucket_name]['name'] = last_bucket_name;
                    Buckets[last_bucket_name]['label'] = lastText;
                  }
                  else{
                    if( 'undefined' == typeof Buckets[last_bucket_name]['labels'] )
                      Buckets[last_bucket_name]['labels'] = [];
                    

                    Buckets[last_bucket_name]['labels'].push({
                      label: Buckets[last_bucket_name]['label'],
                      offset: iTr
                    });
                    Buckets[last_bucket_name]['labels'].push({
                      label: lastText
                    });

                    delete Buckets[last_bucket_name]['label'];
                  }

                  // reset offset
                  iTr = 0;

                  // continue
                  return true;
                }
              }
            }
            else{
              // collecting image
              $tr.find("img").each(function(){
                var $img = $(this);
                Buckets[last_bucket_name]['smilies'].push([
                  $img.attr('src'),
                  $img.attr('alt'),
                  $img.attr('title')
                ]);
                iTr++;
              });
            }
          });

          // get collected values...
          clog('fetching smilies done.');
          clog( Buckets );

          if('function' == typeof cb)
            cb( Buckets );
        }
        else{

          clog("DOM changed, image item not found");
        }
      }
      else{

        clog("Unable get data from: "+url);
      }
    });
  },
  callback_handler: function(x){
    var smiley_bulk = {
          lastupdate: (new Date().getTime()).toString(),
          ksk_smiley: x
        }
    ;
    clog('inside callback_handler');
    clog(smiley_bulk);

    clog('saving smilies_bulk')
    setValue(KS + 'SMILIES_BULK', JSON.stringify(smiley_bulk), function(){
      // commencing outside callback to continue, getSettings
      clog('commencing outside callback');
      if( 'function' == typeof _UPD_SMILIES.callback_ext )
        _UPD_SMILIES.callback_ext( smiley_bulk );
      else
        clog('callback_ext is not a function..');


      clog('dismissing dialog smiley...');
      _UPD_SMILIES.dialog_dismiss();
    });

  },
  run: function(cb_run){
    var ME = this;
    _UPD_SMILIES.callback_ext = cb_run;

    ME.dialog(true, 'Updating smilies..');
    ME.check( ME.callback_handler );
  }
};

/*
* object urusan CSS preloader
* first-time use will be trigger this object to work
* cache the css fetched from googlecode
*/
var _CSS = {
  engage:false,
  init:function(){
    _CSS.path_uri = gvar.kqr_static;
    // flag we'll be running xhr get css
    _CSS.dovalidate = false;

    _CSS.DialogId = null;
  },
  dialog: function(doshow){
    if( !_CSS.DialogId )
      _CSS.DialogId = 'css_' + String(gvar.scriptMeta.timestamp);

    if(_CSS.DialogId && !$('#'+_CSS.DialogId).length ){
      $('body').append( rSRC.getAlert(_CSS.DialogId, doshow) );
      $('#'+_CSS.DialogId).find('.close').click(function(){
        _CSS.dialog_dismiss();
      });
    }
  },
  dialog_html: function(x){
    $('#'+_CSS.DialogId).show().find('.tXt').html(x);
  },
  dialog_dismiss: function(xfade){
    !xfade && (xfade = 222);
    $('#'+_CSS.DialogId).length && $('#'+_CSS.DialogId).fadeOut(xfade, function(){
      $(this).remove();
    });
  },
  dialog_retry: function(){
    _CSS.dialog_html('Loading...');

    // reset localstorage before refetching
    setValue(KS + 'CSS_BULK', '', function(){
      _CSS.init();
      _CSS.run(gvar.css_default, _CSS.callback);
    });
  },
  run: function(fn, cb){
    _CSS.dovalidate = 1;
    _CSS.dialog(1);

    GM_XHR.uri = _CSS.path_uri + fn + '?nocache' + String(gvar.scriptMeta.timestamp) + '-' + String(gvar.scriptMeta.cssREV);

    clog('fetch css: ' + GM_XHR.uri);
    GM_XHR.cached = false;
    GM_XHR.forceGM = true;
    GM_XHR.request(null, 'GET', "function" == typeof cb ? cb : _CSS.callback_fin);
  },
  callback_fin: function(x){
    clog('inside callback_fin');
    x = trimStr( String( x.responseText ) );
    _CSS.set_css(x);
  },
  set_css: function(c, cb){
    c && setValue(KS + 'CSS_BULK', c, function(){
      GM_addGlobalStyle(c, 'xhr_css', 1);
      var metacss, cucok;
      if( cucok = /\bcssREV\:(\d+)/.exec(c) )
        metacss = cucok[1]+ ';' + (new Date().getTime()).toString();

      clog("metacss="+metacss);

      metacss &&
      setValue(KS + 'CSS_META', metacss, function(){
        if(typeof cb=='function') cb();
      });

      gvar.on_demand_csscheck = _CSS.dom_css_validate;
      _CSS.dovalidate && ("function" === typeof gvar.on_demand_csscheck)
        && gvar.on_demand_csscheck();
    });

    !c && ( gvar.on_demand_csscheck = _CSS.dom_css_validate );
  },
  dom_css_validate: function(){
    window.setTimeout(function(){
      var $tgt, _id = _CSS.DialogId;
      $tgt = $('#'+gvar.qID);


      !(_id && $('#'+_id).length) && _CSS.dialog();
      _id = _CSS.DialogId;

      if( $tgt && $tgt.length && $tgt.is(":visible") ){
        if( $tgt.outerHeight() >= 210 ){

          _CSS.dovalidate && _CSS.dialog_html('#okesip!');
          window.setTimeout(function(){
            _CSS.dialog_dismiss(!_CSS.dovalidate?0:222);
          }, !_CSS.dovalidate?0:987);
        }
        else{
          var mtitle = 'Your QR CSS not correctly loaded';
          _CSS.dialog_html('<span title="'+mtitle+'" title="'+mtitle+'">oOops..</span> <a class="'+_id+'-qrR" href="javascript:;" title="Retry fetch CSS">retry?</a> or <a class="'+_id+'-qrS" href="javascript:;" title="Reset Settings">reset?</a>');
          $('#'+_id).find('.'+_id+'-qrR').click(function(){
            _CSS.dialog_retry()
          });
          $('#'+_id).find('.'+_id+'-qrS').click(function(){
            _STG.reset_settings()
          });
          console.log('Failed-load-css-resource: '+gvar.kqr_static+gvar.css_default);

          // failover try to keep it loaded
          var csslink = createEl('link', {href: gvar.kqr_static+gvar.css_default, rel:'stylesheet', type:'text/css'});
          $('body').prepend( $(csslink) );
        }
      }
      else{
        // it might hidden, eg. locked thread. So, ignore css warn.
        _CSS.dialog_dismiss();
      }
    }, 1234);
    gvar.on_demand_csscheck && (delete gvar.on_demand_csscheck);
  }
};

// toggle add/remove style node of theme fixups
function set_theme_fixups(){
  clog("Injecting theme fixups");
  var fxcss_id = 'kqr-thmfixups-'+gvar.scriptMeta.cssREV;

  $("#"+fxcss_id).length &&
    $("#"+fxcss_id).remove();
  GM_addGlobalStyle(rSRC.getCSS_Fixups(gvar.settings.theme_fixups), fxcss_id, 1);
  $("#"+fxcss_id).attr('data-theme', gvar.settings.theme_fixups);


  clog("adjusting entry-body..");
  var css, cbodyWidth = (function(){
    var trh=0, mcW, sbaW, $sbauthor, $mc = $('*[class^="main-content"]').first();
    mcW = $mc.outerWidth();
    if( mcW == 860 ) return null;
    if( mcW == 1097 ) trh = -3;

    $sbauthor = $mc.find(".postlist .author").eq(1);
    if( !$sbauthor.length ){
      $sbauthor = $mc.find(".postlist .author").eq(0);
      sbaW = $sbauthor.outerWidth();
      clog("one post in page, sbaW="+sbaW);
    }
    else{
      sbaW = $sbauthor.outerWidth();
      clog("second post found in page, sbaW="+sbaW);
    }

    clog('".main-content*" width='+mcW);
    return mcW - sbaW - 2 + trh;
  })();

  if( cbodyWidth ){
    css = 'body.response #thread_post_list .row.nor-post .postlist .entry-body{width:'+cbodyWidth+'px}';

    $("#"+fxcss_id).get(0)
      .appendChild(createTextEl(css));
  }
}

/*
* cek update (one_day = 1000*60*60*24 = 86400000 ms) // milisecs * seconds * minutes * hours
* customized from FFixer & userscript_updater
* previous name was : Updater
*/
var _UPD = {
  caller:'',
  check: function(forced){
    var intval = ( 1000 * 60 * 60 * gvar.settings.updates_interval );
    getValue(KS + 'QR_LastUpdate', function(retlu){
      if( !retlu ) retlu = 0;
      if( forced || (parseInt(retlu) + parseInt(intval) <= (new Date().getTime())) ){
        gvar.updateForced = forced;
        if(!forced) _UPD.caller='';

        // rerouting the origin
        GM_XHR.uri = 'https://greasyfork.org/scripts/' + gvar.scriptMeta.scriptID_GF + '/code.meta.js';
        GM_XHR.cached = false;
        GM_XHR.forceGM = true;
        GM_XHR.request(null, 'GET', _UPD.callback);
      }
    });
  },
  callback: function(r){ 
    var value = ( (new Date().getTime()) + "" );
    
    // debug mode
    // var value = "1111";

    
    setValue(KS+'QR_LastUpdate', value, function(){
      if( $(_UPD.caller).get(0) ){
        $(_UPD.caller).parent().find('.uloader').hide();
        $(_UPD.caller).show();
      }

      try{
        if( r && r.responseText.match(/@timestamp(?:[^\d]+)([\d\.]+)/)[1] > gvar.scriptMeta.timestamp ){
          _UPD.initiatePopup(r.responseText, function(){
            if( gvar.updateForced )
              close_popup();
          },function(){
            if( gvar.updateForced )
              $('.bar-update a').trigger('click');
          });
        }else {
          if(gvar.updateForced)
            alert("No update is available for QR.")
        }
      }catch(e){}
    });
  },
  initiatePopup: function(rt, cb_early, cb_lazy){

    if($('.bar-update').get(0))
      $('.bar-update').remove();
    if($('#modal_update_box').get(0))
      $('#modal_update_box').remove();
      
    $('.xkqr > .entry-head')
      .prepend(''
        +'<div class="bar-update" style="display:none">'
        +'<a href="javascript:;" class="goog-btn goog-btn-red" title="New Update Available"><i class="fa fa-info-circle"></i></a>'
        +'</div>'
      );

    myfadeIn($('.bar-update'), 985, function(){
      $('.bar-update a').click(function(){
        _UPD.meta = _UPD.mparser( rt );
        clog(_UPD.meta);

        $('#qr-modalBoxFaderLayer').css('visibility', 'visible').show();
        $('body').prepend( rSRC.getDialog("TPLUpdateDialog") );
        $('#modal_update_box').fadeIn(130, function(){
          _UPD.design(); _UPD.event();
        });
        resize_popup_container(450);
      });

      if("function" == typeof cb_lazy)
        cb_lazy();
    });

    if("function" == typeof cb_early)
      cb_early();
  },
  design: function(){
    swapCol();

    var tpl = ''
      +'<b>New'+' '+gvar.titlename+'</b> (v'+ _UPD.meta.cvv[1]+') is available'
      +'<div style="float:right;"><a class="qbutton" href="https://'+ 'greasyfork.org'
      +'/scripts/'+gvar.scriptMeta.scriptID_GF+'" target="_blank" title="QR in greasyfork.org"><b>v'+ _UPD.meta.cvv[1]+'</b></a></div>'
    ;
    $('#box_update_title').html( tpl );
    tpl = ''
      +'<h4><span>&#9660;</span> What\'s New</h4>'
      +'<div class="update-panel toggle-panel" style="display:block;">'
      + _UPD.meta.news + '<br/>'
      +'</div>'
    ;
    $('#content_update').addClass('help-content').html( tpl );
  },
  event: function(){
    $('#box_cancel, .modal-dialog-main .kqr-icon-close').click(function(){
      close_popup()
    });
    
    $("#content_update h4").click(function(){
      var isclose, cont, h4 = $(this);
      $(this).parent().find('.toggle-panel').slideToggle(160, function () {
        isclose = $(h4).hasClass('isclose');
        cont = $(this);
        if( !isclose ){
          $(cont).slideUp();
          $(h4).addClass('isclose');
        }else{
          $(cont).slideDown(160);
          $(h4).removeClass('isclose');
        }
        $(h4).find('span').html( isclose ? '&#9660;' : '&#9654;');
      });
    });

    var uri = 'https://greasyfork.org/scripts/' + gvar.scriptMeta.scriptID_GF + '/code.user.js';
    $('#box_update').attr("href", uri).text("Update").removeClass("hide").show();
    // $('#box_update')
    //   .attr('target', '_blank')
    //   .attr('href', 'https://greasyfork.org/scripts/' + gvar.scriptMeta.scriptID_GF + '/code.user.js?nocache='+Math.random().toString().replace('0.',''))
    ;
  },
  mparser: function(rt){
    var ret = {
      tv:rt.match(/@timestamp(?:[^\d]+)([\d]+)/)||[null],
      cvv:rt.match(/@version(?:[^v\d]+)([\d\.\w]+)/)||[null],
      news:(function(x){
        var r, p, wrp = ['// -!--latestupdate','// -/!latestupdate---'];
        p = [x.indexOf(wrp[0]), x.indexOf(wrp[1])];
        r = (p[0]!=-1 && p[1]!=-1 ? String( x.substring(p[0]+wrp[0].length, p[1]) ).replace(/\/+\s*/gm, function($str,$1){return " ";}) : '');
        return r.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/(?:\r\n|\n|\r)/gi,'<br/>');
      })(rt)
    };
    return ret;
  }
};
// -end UPD

/*
* object urusan parsing text
* mostly quick-quote purpose
*/
var _QQparse = {
  init:function(calee, cb){
    var par, mqs_id = [];
    $('a[data-btn="multi-quote"].btn-orange').each(function(){
      par = $(this).closest('.row');
      if( $(par).get(0) ) mqs_id.push( $(par).attr('id') );
    });
    if(mqs_id.length == 0){
      clog('no multiquote, perform to this calee');
      par = $(calee).closest('.row');
      if( $(par).get(0) ) mqs_id.push( $(par).attr('id') );
    }else{
      do_click($('#sdismiss_quote').get(0));
    }
    this.cb = cb;
    this.mqs_id = mqs_id;
    this.title = false; // {icon:'{SRC}', text:'{TEXT}'}
    this.start();
  },
  start:function(){
    var ret, buff, $entry, entrycontent, post_id, _QQ = this;
    $.each( _QQ.mqs_id, function(){
      post_id = this;
      $entry = $('#'+post_id).find('.entry');
      if( $entry.length ){
        
        // entrycontent = ($entry.hasClass("product-detail") ? $entry.find() )
        if( $entry.hasClass("product-detail") ){
          $entry = $entry.find(".tab-pane.active").clone();
          $entry.find(".row").first().remove();
          $entry.find("h3").first().remove();
        }
        entrycontent = $entry.html();

        buff = String( entrycontent ).replace(/(\r\n|\n|\r|\t|\s{2,})+/gm, "");
        buff = buff.replace(/(?:<\!-{2,}reason\s?[^>]+.)+/gi, '');
        
        ret = _QQ.parseMSG( buff );
        clog('ret after parseMSG=' + ret);
        
        _TEXT.init();

        if( ret )
          _TEXT.add( '[QUOTE=' + _QQ.get_quotefrom(post_id) + ']' + ret + '[/QUOTE]' + "\n\n" );
      }
    });
  },
  count_spoilers: function($html){
    return $('.spoiler', $html).length
  },
  get_quotefrom: function(pid){
    var nameStr, thename, el;
    thename = $('#'+pid).find('.nickname').html();
    
    if( !thename ){
      // guessing on fjb thread-v2
      thename = $('.seller-detail-info').find('.username > a').html();
    }
    el = createEl('div', {}, thename);

    nameStr = trimStr($(el).text().toString()).replace(/\[\$\]$/, '');
    $(el).remove();
    return trimStr( nameStr ) + (gvar.thread_type == 'group' ? '' : ';'+pid.replace(/^post/i, ''));
  },
  clearTag: function(h, tag){
    if( isUndefined(tag) ){
      return trimStr( h.replace(/<\/?[^>]+>/gm,'') )||'';
    }else{
      var re = new RegExp('[\\r\\n\\t]?<\\\/?(?:'+tag+')(?:[^>]+)?.[\\r\\n\\t]?', "gim"); 
      return h.replace(re,'');
    } 
  },
  
  parseTITLE: function(el){
    var _src, _icon_name;
    _src = $('img', $(el));
    
    _src = ( $(_src).get(0) ? basename( $(_src).attr('src') ).replace(/\./g,'') : '' );
    this.title = {
      icon: _src,
      text: $(el).text()
    };
  },
  parseMSG: function(x){

    var _QQ = this;
    var $pCon,pCon,els,el,el2,eIner,cucok,openTag,sBox,nLength,LT,pairedEmote;
    var ret, contentsep, pos;
    
    LT = {'font':[],'sp':[],'a':[],'align':[],'coder':[],'list':[]};
    pairedEmote = false;
    
    var 
    cleanup_quote = function(innerquote_html){
      clog('inside cleanup_quote');
      var cucok, rgx, href, brpos, newhtml_string='', newhtml, $wrapdiv = createEl('div', {}, innerquote_html);
      $wrapdiv = $($wrapdiv);
      newhtml_string = $wrapdiv.find('>span').last().html();

      if( innerquote_html.match(/>Original\sPosted\sBy\s/) ){
        //clog('is original posted by, == '+ newhtml_string);

        $wrapdiv = $( createEl('div', {}, newhtml_string) );
        newhtml = ['','','']; // id,user,content

        newhtml[0] = $wrapdiv.find('>b:first').text();
        href = $wrapdiv.find('>a:first').attr('href');
        if( cucok = /\#post([^\b]+)/i.exec(href) )
          newhtml[1] = cucok[1];

        rgx = new RegExp("^\\bOriginal\\sPosted\\sBy\\s[^\\"+HtmlUnicodeDecode('&#9658;')+"]+.<\\/a>(?:<br\\s*\\/?>)?");
        newhtml[2] = newhtml_string.replace(rgx, '');
      }
      else{
        newhtml = newhtml_string;
      }
      clog('CLEAN-QUOTE='+dump(newhtml));
      return newhtml;
    },
    revealQuoteCode = function(html){

      var els,el,el2,el2tmp,tag, cucok, XPathStr='.//span[@class="post-quote"]', rvCon = pCon;
      if( isDefined(html) ){
        // fix align inside spoiler
        html = String(html).replace(/<(\/?)([^>]+)>/gm, parseSerials );
        rvCon = createEl('div',{style:'display:none'},html);
      }
      //clog('inside revealQuoteCode\n' + $(rvCon).html() )
      els = $D(XPathStr, rvCon);
      //clog(' quote objects len = ' + els.snapshotLength)
      if(els.snapshotLength) for(var i=0;i<els.snapshotLength; i++){
        el = els.snapshotItem(i);
        var elhtml = $(el).html();
        if( elhtml.match(/Quote:/) ){
          //clog('ada Quote')
          if( !gvar.settings.plusquote ){
            el2 = createTextEl('\n');
            el.parentNode.replaceChild(el2,el);
          }
          else{
            var iner, _newhtml = cleanup_quote( elhtml );
            if( _newhtml ){
              _newhtml = ('[QUOTE'+(isString(_newhtml) ? '' : '='+_newhtml[0]+';'+_newhtml[1])+']'
                +(_newhtml && isString(_newhtml) ? _newhtml : _newhtml[2]) +'[/QUOTE]');
              iner = double_encode( _newhtml );
              iner = createTextEl( _QQ.parseMSG( iner ) );
              el.parentNode.replaceChild(iner, el);
            }
          }
        }
      }
      // remove last edited
      $('.edited', $(rvCon) ).remove();
      return $(rvCon).html();
    }
    ,br2nl = function(text){

      return text.replace(/<br\s*(?:[^>]+|)>/gi, "\n")
    }
    ,revealCoders = function(html){
      var els,el,cucok, XPathStr = './/div[contains(@style,"margin-bottom")]', rvCon = pCon;
      if( isDefined(html) ){
        // fix align inside spoiler
        html = String(html).replace(/<(\/?)([^>]+)>/gm, parseSerials );
        rvCon = createEl('div',{style:'display:none'},html);
      }
      
      //clog('inside revealCoders\n' + $(rvCon).html() )
      els = $D(XPathStr, rvCon);
      //clog(' quote objects len = ' + els.snapshotLength)
      if(els.snapshotLength) for(var i=0;i<els.snapshotLength; i++){
        el = els.snapshotItem(i);
        if(cucok = $(el).html().match(/(?:(HTML|PHP)\s{1})*Code:/)) {
          //clog('is coder..' + (cucok && cucok[1] ? cucok[1] : 'CODE') );
          $(el).next().attr('rel', (cucok && cucok[1] ? cucok[1] : 'CODE') );
          
          if(cucok[1]=='PHP' || cucok[1]=='HTML'){
            var _html = (cucok[1]=='PHP' ? $(el).next().find('code').html() : $(el).next().html() );
            if( _html ){
              _html = _html.replace(/<\/?span(?:[^>]+)?>/gim, '');
              _html = br2nl(_html);
              $(el).next().html( entity_encode(_html) );
            }
          }
        }
        try{Dom.remove(el)}catch(e){};
      }
    }
    ,parseSerials = function(S,$1,$2){
      var mct, parts, pRet, lastIdx, tag, _2up;
      _2up = $2.toUpperCase();
      clog('inside parseSerials 2up=[' + _2up + ']');

      // parse BIU -> I is using EM by now
      if ( $.inArray(_2up, ['B','EM','U']) != -1 ){
        clog('bbcode recognized: ['+_2up+']');
        (_2up == 'EM') && (_2up = 'I');
        return '[' + ($1 ? '/' : '') + _2up + ']';
      }else
      
      // parse code
      if( /^pre\s/i.test($2) || _2up=='PRE' ){
        clog('parse PRE');
        mct = $2.toLowerCase().match(/\/?pre(?:(?:\s*(?:\w+=['"][^'"]+.\s*)*)?\s?rel=['"]([^'"]+))?/i);
        
        if( isDefined(mct[1]) ){
          LT.coder.push( mct[1].toUpperCase() );
        }else{
          mct[1] = false;
        }
        
        openTag= ( mct && mct[1] );
        if( openTag ){
          mct[1] = mct[1].toUpperCase();
          clog('bbcode recognized: ['+mct[1].toUpperCase()+']');
        }
        lastIdx = LT.coder.length-1;
        
        pRet= (openTag ? '['+mct[1]+']' : (isDefined(LT.coder[lastIdx]) ? '['+'/'+LT.coder[lastIdx].toUpperCase()+']' : '') );
        
        if( !openTag )
          LT.coder.splice(lastIdx,1);
        return pRet;
      }else

      // parse list (number/bullet)
      if( /^(?:ul|ol)\s/i.test($2) || _2up=='OL' || _2up=='UL'){
        clog('parse list UL');
        mct = [];
        if( $2.indexOf('decimal;')!=-1 ){
          mct = ['','LIST=1']; // numbering...
        }else
        if( $2.indexOf(':disc;')!=-1 ){
          mct = ['', 'LIST']; // list
        }

        if( isDefined(mct[1]) ){
          mct[1] = mct[1].toUpperCase();
          LT.list.push( mct[1] );
        }else{
          mct[1] = false;
        }

        openTag = ( mct && mct[1] );
        if( openTag ){
          mct[1] = mct[1].toUpperCase();
          clog('bbcode recognized: ['+mct[1]+']');
        }
        lastIdx = LT.list.length-1;

        pRet= (openTag ? '['+mct[1]+']' : (isDefined(LT.list[lastIdx]) ? '['+'/'+LT.list[lastIdx].replace(/\=[^\b]+/g, '').toUpperCase()+']' : '') );
        
        if( !openTag )
          LT.list.splice(lastIdx,1);
        return pRet;
      }else

      // parse hand of list
      if( /^li/i.test($2) || _2up=='LI' ){
        clog('parse list LI');
        if( (openTag = !$1) ){
          clog('bbcode recognized: [*]');
        }
        pRet= (openTag ? '[*]' : '');

        return pRet;
      }else
      
      // parse align | color | font | size;
      if( /^span\s/i.test($2) || _2up=='SPAN'){
        clog('parse SPAN align | color | font | size');
        if( $2.indexOf('-align:')!=-1 ){
          
          mct = $2.match(/\/?span(?:(?:[^\-]+).align\:(\w+))?/i);
          openTag= ( mct && mct[1] );
        }else 
        if( $2.indexOf('color:')!=-1 ){
          mct = $2.match(/\/?span(?:(?:[^\'\"]+).(color)\:([^\!]+))?/i);
          openTag = (mct[1] && isDefined(mct[2]) && mct[2]);
        }
        else
        if( $2.indexOf('-family') != -1 ){
          mct = $2.match(/\/?span(?:(?:[^\'\"]+).(font)-family\:([^\!]+))?/);
          openTag = (mct[1] && isDefined(mct[2]) && mct[2]);
        }
        else
        if( $2.indexOf('-size') != -1 ){
          mct = $2.match(/\/?span(?:(?:[^\'\"]+).font-(size)\:([\d]+px))?/);
          openTag = (mct[1] && isDefined(mct[2]) && mct[2]);
          if( openTag ){
            var size_maper = {
              '10px': '1',
              '12px': '2',
              '14px': '3',
              '16px': '4',
              '20px': '5',
              '24px': '6',
              '28px': '7'
            }
            mct[2] = ( isDefined(size_maper[mct[2]]) ? size_maper[mct[2]] : '3');
          }
        }
        else
        if( $2.indexOf('post-quote') != -1 ){
          mct = ['','quote', false];
          openTag= true;
        }
        else{
          mct = [0,false];
          openTag = false;
        }

        if( isDefined(mct[1]) && mct[1] ){
          LT.align.push( mct[1].toUpperCase() );
        }
        
        if( openTag ){
          mct[1] = mct[1].toUpperCase();
          clog('bbcode recognized: ['+mct[1].toUpperCase()+']');
        }
        lastIdx = LT.align.length-1;
        
        pRet= (openTag ? '['+mct[1] + (mct[2] ? '='+trimStr(mct[2]) : '')+']' : (isDefined(LT.align[lastIdx]) ? '['+'/'+LT.align[lastIdx].toUpperCase()+']' : '') );
        
        if( !openTag )
          LT.align.splice(lastIdx,1);
        return pRet;
      }else
      
      // parse html | php | indent
      if( /^div\s/i.test($2) || _2up=='DIV'){
        clog('parse DIV html | php | indent');
        if( mct = $2.toLowerCase().match(/\s1em\s40px/) )
          mct = [$2, 'INDENT'];
        else
          mct = $2.toLowerCase().match(/\/?div(?:(?:\s*(?:\w+=['"][^'"]+.\s*)*)?\s?rel=['"]([^'"]+))?/i);
        
        if( isDefined(mct[1]) ){
          LT.coder.push( mct[1].toUpperCase() );
          
        }else{
          mct[1] = false;
        }       
        openTag= ( mct && mct[1] );
        if( openTag ){
          mct[1] = mct[1].toUpperCase();
          clog('bbcode recognized: ['+mct[1].toUpperCase()+']');
        }
        lastIdx = LT.coder.length-1;
        
        pRet= (openTag ? '['+mct[1]+']' : (isDefined(LT.coder[lastIdx]) ? '['+'/'+LT.coder[lastIdx].toUpperCase()+']' : '') );
        
        if( !openTag )
          LT.coder.splice(lastIdx,1);
        return pRet;
      }else
      
      // parse linkify
      if( /\shref=/i.test($2) || _2up=='A' ){
        mct = $2.match(/\/?a\s*(?:(?:target|style|title|linkid)=[\'\"][^\'\"]+.\s*)*(?:\s?href=['"]([^'"]+))?/i);
        if( isDefined(mct[1]) ){
          tag = (/^mailto:/.test(mct[1]) ? 'EMAIL' : 'URL' );
          if( tag=='EMAIL' )
            mct[1] = mct[1].replace(/^mailto:/i,'');
          LT.a.push( tag );
        }else{
          mct[1] = false;
        }
        openTag = (mct && mct[1]);
        if( openTag ){
          mct[1] = (isLink(mct[1]) ? mct[1] : mct[1].toUpperCase());
          clog('bbcode recognized: ['+mct[1]+']');
        }
        lastIdx = LT.a.length-1;

        if( mct && mct[1] ){
          pRet = (isDefined(LT.a[lastIdx]) ? '['+LT.a[lastIdx].toUpperCase()+(LT.a[lastIdx].toUpperCase()=='URL' ? (mct[1] == '#__kqr-blank-for-absurl__'.toUpperCase() ? '' : '='+mct[1]) : '') +']' :'');
        }
        else{
          pRet = (isDefined(LT.a[lastIdx]) ? '['+'/'+LT.a[lastIdx].toUpperCase()+']' : '');
        }
        
        if( !openTag )
          LT.a.splice(lastIdx,1);

        return pRet;
      }else
      
      // parse img
      if( /\sSRC=/i.test(_2up) ){
        clog('parse SRC');
        mct = $2.match(/\ssrc=['"]([^'"]+)/i);
        
        if( mct && isDefined(mct[1]) ){

          if( /^embed\s*/i.test($2) && (cucok = mct[1].match(/\byoutube\.com\/(?:watch\?v=)?(?:v\/)?([^&\?]+)/i)) ){
            clog('bbcode recognized: [YOUTUBE]');
            return ( '[YOUTUBE]' + cucok[1] + '[/YOUTUBE]' );
          } else
          if( /^iframe\s*/i.test($2) && (cucok = mct[1].match(/\bvimeo\.com\/video\/([^&\b\?]+)/i)) ){
            clog('bbcode recognized: [VIMEO]');
            return ( '[VIMEO]' + cucok[1] + '[/VIMEO]' );
          } else
          if( /^iframe\s*/i.test($2) && (cucok = mct[1].match(/\bsoundcloud\.com\/tracks\/([^&\b\?]+)/i)) ){
            clog('bbcode recognized: [SOUNDCLOUD]');
            return ( '[SOUNDCLOUD]' + cucok[1] + '[/SOUNDCLOUD]' );
          } else
          if( cucok = $2.match(/img\s*(?:(?:alt|src|class|border)=['"](?:[^'"]+)?.\s*)*title=['"]([^'"]+)/i)){
            // is kaskus emotes?
            if( cucok ){
              tag = mct[1].replace(/[^\w]/g,'').toString();
              
              if( !pairedEmote )
                pairedEmote = prep_paired_emotes();
              
              return ( isDefined(pairedEmote[tag]) ? pairedEmote[tag] : '[IMG]'+mct[1]+'[/IMG]' );
            }
          }else {
            clog('bbcode recognized: [IMG]');
            return '[IMG]'+mct[1]+'[/IMG]';
          }
        }else{
          return '';
        }
      }else{
        return S;
      }
    }
    ,parseCleanUpLink = function(S, $1, $2){
      var parts, px_head, px_tail, countTripleDot;
      var mct = $1.match(/\s*(?:(?:target|style|title|linkid)=[\'\"][^\'\"]+.\s*)*(?:\s?href=['"]([^'"]+))?/i);
      
      if( mct && mct[1] ){
        if( /^https?\:\/\/www\.kaskus\.co\.id\/redirect\b/.test(mct[1]) )
          mct[1] = unescape( mct[1].replace(/^https?\:\/\/www\.kaskus\.co\.id\/redirect\?url=/i, '') );

        countTripleDot = ($2.match(/\.{3}/g) || []).length;
        if( /^(?:ht|f)tps?\:\/\//.test(mct[1]) && countTripleDot === 1 ){
          parts = $2.split("...");
          if( parts[1].length == 14 ){
            px_head = new RegExp('^'+parts[0].replace(/(\W)/g, "\\$1"));
            px_tail = new RegExp(parts[1].replace(/(\W)/g, "\\$1")+'$');
            if( mct[1].match(px_head) && mct[1].match(px_tail) ) 
              return '<a href="#__kqr-blank-for-absurl__">'+mct[1];
          }
        }
        else
          return S.replace(/<a[^>]+>/, '<a href="'+mct[1]+'">');
      }

      return S;
    }
    ,double_encode= function(x){
      x = br2nl(x);
      return x
        .replace(/\&amp;/gm,'&amp;amp;')
        .replace(/\&lt;/gm,'&amp;lt;')
        .replace(/\&gt;/gm,'&amp;gt;')
      ;
    };
    
    // make a fake container for this inner x
    pCon = createEl('div', {style:'display:none'}, x);
  
    // clean messy from ksa, based on id=KSA-
    els = $D('.//span[starts-with(@id,"KSA-")]', pCon);
    nLength = (els.snapshotLength-1);
    for(var i=nLength; i>=0; i--){
      el = els.snapshotItem(i);
      if( el ) Dom.remove(el);
    }

    // clean messy from grey-ish, based on kaskus givin origin of every link
    els = $D('.//span[contains(@style,"font-size:10px") and contains(@style,"#888")]', pCon);
    nLength = (els.snapshotLength-1);
    for(var i=nLength; i>=0; i--){
      el = els.snapshotItem(i);
      if( el ){
        el2 = el.previousSibling;
        if( el2 && el2.textContent && el2.textContent.trim().length == 0 )
          Dom.remove(el2);

        Dom.remove(el);
      }
    }

    
    $pCon = $(pCon);
    // reveal simple quote
    $pCon.html( revealQuoteCode() );  
    clog('reveal simple quote; pCon=' + $(pCon).html() );
    
    // reveal title post
    el = $('h2', $pCon);
    if( $(el).length ){
      this.parseTITLE( el );
      $('h2', $pCon ).remove();
    }
    
    // reveal spoiler inside
    var total_spoilers;
    //selector_1st_child = '> .spoiler';
    total_spoilers = this.count_spoilers($pCon);
    clog('total spoilers=' + total_spoilers );

    /*
    * when spoiler wrapped with any tags like [font,b,...],
    * will fail getting its 1deg spoiler, which might not be cleared in parseSerials
    * need to seach it first then.
    * still we limited around 63 nested tags only, fix-me!
    */
    if(total_spoilers > 0){
      var newhtml = (function($, $_pCon){
        var selectorSpoiler, selector_1st_child, notfound, threshold=100, step=0;
        selectorSpoiler = selector_1st_child = '> .spoiler';
        $_pCon.find('input[class^="spoiler_"]').remove();
        clog('indigo...=' + $_pCon.html());

        if($(selector_1st_child, $_pCon).length == 0){
          notfound = 1; step = 0;
          while(notfound){
            ++step;
            selectorSpoiler = '> * ' + selectorSpoiler;
            notfound = ($(selectorSpoiler, $_pCon).length == 0);
            if(step >= threshold) break;
          }
        }

        // bbcode_div
        $(selectorSpoiler, $_pCon).each(function(){
          var title, cucok, newEl, tmptit, _newhtml, iner = $(this).find('#bbcode_inside_spoiler:first').html()
          title = $(this).find('i:first').html();

          _newhtml = ('[SPOILER='+ (title ? title : ' ') +']'+ (iner ? iner : ' ') +'[/SPOILER]');
          iner = double_encode( _newhtml );
          iner = _QQ.parseMSG( iner );
          
          newEl = ( createTextEl(entity_decode(iner)) );
          $(this).replaceWith( $(newEl) );
        });
        return $_pCon.html();
      })($, $pCon);
      clog('pCon after spoiler=' + $pCon.html() );

      $pCon.html(newhtml);
    }

    clog('recheck spoiler=' + this.count_spoilers($pCon));
    if(this.count_spoilers($pCon) > 0){
      x = this.parseMSG($pCon.html());

      clog('return from recheck spoiler=' + x);
      $pCon.html(x);
    }

    // clean-up youtube thumb
    $('div[onclick*=".nextSibling"]', $pCon ).remove();
    
    // reveal code inside
    $pCon.html( revealCoders() );
    //clog('pCon after coder / before decode parseSerials=' + $pCon.html() );

    x = double_encode($pCon.html());
    pCon = null; $pCon = null;

    // cleanup parser for <A>
    x = trimStr( String(x).replace(/<a([^>]+).([^<]+)/gm, parseCleanUpLink ));


    clog("x pra-parseCleanUpLink, before-parseSerials");
    clog(x);

    // serials parse
    ret = trimStr( String(x).replace(/<(\/?)([^>]+)./gm, parseSerials ));

    clog("x pra-parseSerials");
    clog(x);
    
    // clean rest (unparsed tags)
    return unescapeHtml( entity_decode(this.clearTag( ret )) );
  }
};

/*
* cross-browser XHR method
*/
var GM_XHR = {
  uri:null,
  returned:null,
  forceGM:false, // force with GM-XHR & avoid using Native-XHR when with multifox
  cached:false,
  events:false,
  request: function(cdata, met, callback){
    if( !GM_XHR.uri ) return;
    met=(isDefined(met) && met ? met:'GET');
    cdata=(isDefined(cdata) && cdata ? cdata : null);
    if( typeof callback != 'function') callback=null;
    var pReq_xhr = {
      method: met,
      url:  GM_XHR.uri + (GM_XHR.cached ? '' : (GM_XHR.uri.indexOf('?')==-1?'?':'&rnd=') + Math.random().toString().replace('0.','')),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      data: (isString(cdata) ? cdata : ''),
      onload: function(ret) {
        if(ret.status==503){
          clog('Reach 503, retrying...');
          window.setTimeout(GM_XHR.request(cdata,met,callback), 777);
        }else{
          var rets=ret;
          if(callback!=null)
            callback(rets);
          else
            GM_XHR.returned = rets;
        }
      }
    };
    if( !GM_XHR.forceGM ) // always use this native; except update checker
      NAT_xmlhttpRequest( pReq_xhr );
    else
      GM_xmlhttpRequest( pReq_xhr );
  }
};

/*
* native/generic XHR needed for Multifox, failed using GM_xmlhttpRequest.
*/
var NAT_xmlhttpRequest=function(obj) {
  var request = new XMLHttpRequest();
  request.onreadystatechange=function() {
    if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); }
  };
  request.onerror=function() { if(obj.onerror) { obj.onerror(request); } };
  try {
    request.open(obj.method,obj.url,true); 
  }catch(e) {
    if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return;
  }
  if(obj.headers) {
    for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); }
  }
  request.send(obj.data);
  return request;
};

// mode = ['editor', 'saving', 'view']
function validTag(txt, doreplace, mode){
  if( !isString(txt) ) return false;
  var ret, val, title, matches, re, cucok = false;  
  ret = txt;
  matches = {
    "{title:(.+)}" : ['b', '$1'],
    "{sctag:(br)}" : ['br','']
  };
  for(var torep in matches){
    re = new RegExp(torep, "");
    if( ret.match(re) ){
      cucok=true;
      //clog('cur torep='+torep)
      if(isDefined(doreplace) && doreplace){ // must be from view mode
        val = ret.replace(re, matches[torep][1]);
        val = do_sanitize(val);
        ret = '<'+ matches[torep][0] + (matches[torep][0] == 'br' ? '/':'') + '>' + (val && matches[torep][0] != 'br' ? val + '</'+ matches[torep][0] +'>' : '');
      } else if(isDefined(mode) && mode=='editor') {
        // editor mode and it's a BR
        if(torep=='{sctag:(br)}') 
          ret=txt.replace(re, '\n');
        else{
          // guess it should be a title
          title = re.exec( txt );
          //clog('mode='+mode+'; title; title='+title)
          if(re && isDefined( title[1]) ){
            val = do_sanitize( title[1] );
            ret = '{title:'+val+'}\n'; 
          }else{
            ret = txt+'\n'; 
          }
        }
      }
      break;
    }
  }
  return (cucok ? ret : false);
}

function do_sanitize(text){
  var re, torep, do_it_again, fL, filter, ret = text;
  filter = [
    "[\\\"\\\'][\\s]*(javascript\\:+(?:[^\\\'\\\"]+))[\\\"\\\']"
    ,"((?:\\&lt;|<)*script(?:\\&gt;|>)*)"
    ,"((?:\\&lt;|<)*\\/script(?:\\&gt;|>)*)"
    ,"</?(?:[a-z][a-z0-9]*\\b).*(on(?:[^=]+)=[\\\"\\\'](?:[^\\\'\\\"]+)[\\\"\\\'])"
    ,"</?(?:[a-z][a-z0-9]*\\b).+(style=[\\\"\\\'](?:\\w+)\\/\\*[.+]*\\*\\/\\w+\\:[^\\\"]+\\\")"
    ,"<[\s]*>"
  ];
  do_it_again = '';
  fL = filter.length;
  
  // need a loop until it's really clean | no match patern
  while( do_it_again=='' || do_it_again.indexOf('1')!=-1 ) {
    do_it_again = '';
    for(var idx=0; idx<fL; idx++){
      if( !isString(filter[idx]) ) continue;
      re = new RegExp(filter[idx], "ig");
      if( ret.match(re) ){
        do_it_again+='1';
        torep = re.exec(ret);      
          //clog('replacing='+filter[idx]+'; torep='+torep[1]);
        if( torep && isDefined(torep[1]) )
        ret=ret.replace( torep[1], '' );
      }else{
        do_it_again+='0'; // must diff than (do_it_again=='')
      }
    }
  }
  return ret;
}

function myfadeIn(el, d, cb){
  var no_animate = 1;
  if( !d ) d = 100;
  if( typeof cb != 'function') cb = function(){};
  if(no_animate){
    $(el).show();
    d = parseInt(d);
    if(d > 0) gvar.$w.setTimeout(function(){ cb() }, d);
  }else{
    $(el).fadeIn(d, cb);
  }
}
function myfadeOut(el,d, cb){
  var no_animate = 1;
  if( !d ) d = 100; 
  if( typeof cb != 'function') cb = function(){};
  if(no_animate){
    $(el).hide(); 
    d = parseInt(d);
    if(d > 0) gvar.$w.setTimeout(function(){ cb() }, d);
  }else{
    $(el).fadeOut(d, cb);
  }
}
function swapCol(){
  setTimeout(function(){
    $(".modal-dialog-title").addClass("swpcolor");
  }, 123);
}

// load and prep paired kaskus smiley to do quick-quote parsing 
function prep_paired_emotes(){
  // '1' : [H+'ngakaks.gif', ':ngakaks', 'Ngakak (S)']
  // ( !gvar.smbesar || !gvar.smkecil || !gvar.smcustom )
  var sml, paired={}, tmp;
  if( !gvar.smbesar || !gvar.smkecil || !gvar.smkplus )
    rSRC.getSmileySet();

  tmp = (gvar.smkecil && gvar.smkecil.smilies ? gvar.smkecil.smilies : []);
  for(var i=0; i < tmp.length; i++){
    sml=tmp[i];
    paired[ sml[0].replace(/[^\w]/g,'').toString() ] = sml[1].toString();
  }
  tmp = (gvar.smbesar && gvar.smbesar.smilies ? gvar.smbesar.smilies : []);
  for(var i=0; i < tmp.length; i++){
    sml = tmp[i];
    paired[sml[0].replace(/[^\w]/g,'').toString()] = sml[1].toString();
  }
  tmp = (gvar.smkplus && gvar.smkplus.smilies ? gvar.smkplus.smilies : []);
  for(var i=0; i < tmp.length; i++){
    sml = tmp[i];
    paired[sml[0].replace(/[^\w]/g,'').toString()] = sml[1].toString();
  }
  clog("prep_paired_emotes done.");
  clog(paired);
  return paired;
}

function wrap_layout_tpl(text){
  var conf = String(gvar.settings.userLayout.config).split(',');  
  return (conf[1] == 1 ? gvar.settings.userLayout.template.replace(/{message}/gi, text) : text);
}

// domain guess for static or cdn
function domainParse(){
  var l = location.hostname
  return {
    "prot": location.protocol,
    "host": l,

    // host for emoticons
    "assets" : 's.kaskus.id'
  };
}


//=== mini-functions
// static routine
function isDefined(x)   { return !(x == null && x !== null); }
function isUndefined(x) { return x == null && x !== null; }
function isString(x) { return (typeof(x)!='object' && typeof(x)!='function'); }
function trimStr(x) { return (typeof(x)=='string' && x ? x.replace(/^\s+|\s+$/g,"") : '') };
function isLink(x, strict) {
  var re = new RegExp( (strict ? '^':'') + '((?:http(?:s|)|ftp):\\/\\/)(?:\\w|\\W)+(?:\\.)(?:\\w|\\W)+', "");
  return x.match(re);
}
function is_good_json(x){
  return "undefined" != typeof x && /^[\],:{}\s]*$/.test(x.replace(/\\["\\\/bfnrtu]/g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
};
function _o(m,e,f){Dom.Ev(e,m,function(e){typeof(f)=='function'?f(e):void(0)});}
function basename(path, suffix) {
  if( !path ) return path;
  // Returns the filename component of the path  
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // *     example 1: basename('/www/site/home.htm', '.htm');    // *     returns 1: 'home'
  // *     example 2: basename('ecra.php?p=1');
  var b = path.replace(/^.*[\/\\]/g, '');
  if(typeof(suffix) == 'string' && b.substr(b.length-suffix.length) == suffix)
    b = b.substr(0, b.length-suffix.length);
  return b;
};
function gID(x) { return document.getElementById(x) }
function dump(x){return ("undefined" != typeof JSON ? JSON.stringify(x) : x)}
function getHumanDate(thedate){
  var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
      d=('undefined' != typeof thedate && thedate ? new Date(thedate) : new Date())
  ;
  return (
    d.getFullYear().toString() +'-'
    +((d.getMonth()+1).toString().length==1?'0':'')
    +(d.getMonth()+1)+'-'+(d.getDate().toString().length==1?'0':'')
    +d.getDate()+', '
    +days[d.getDay()]+'. '
    +(d.getHours().toString().length==1?'0':'')+d.getHours()+':'+(d.getMinutes().toString().length==1?'0':'')+d.getMinutes()+':'+(d.getSeconds().toString().length==1?'0':'')+d.getSeconds()
  );
}

// native clean-up fetched post
function unescapeHtml(text){
  if( !text ) return;
  var tL, cleanRet='', temp = createEl('div',{},text);
  tL = temp.childNodes.length;
  for(var i=0; i<tL; i++){
    if( typeof(temp.childNodes[i])!='object' ) continue;
    cleanRet += (function (t){
            return t.replace( /\&\#(\d+);/g, function( ent, cG ){return String.fromCharCode( parseInt( cG ) )})
          })(temp.childNodes[i].nodeValue);
  }
  try{ temp.removeChild(temp.firstChild) }catch(e){}
  return cleanRet;
}
function entity_decode(S){
  return S.replace(/\&gt;/gm,'>').replace(/\&lt;/gm,'<').replace(/\&amp;/gm,'&');
}
function entity_encode(S){
  return S.replace(/>/gm,'&gt;').replace(/</gm,'&lt;');
}
function SimulateMouse(elem,event,preventDef) {
  if("object" != typeof elem) return;
  var evObj = document.createEvent('MouseEvents');
  preventDef = ( "undefined" != typeof preventDef && preventDef ? true : false);
  evObj.initEvent(event, preventDef, true);
  try{elem.dispatchEvent(evObj);}
   catch(e){ clog('Error. elem.dispatchEvent is not function.'+e)}
}
function do_click(el){
  SimulateMouse(el, 'click', true);
}
// set css to the element with important priority support
function cssVal($el, styleName, value, priority){
  var style = $el.get(0).style;
  if( !$el.length || isUndefined(styleName) || isUndefined(value) ) return;
  priority = typeof priority != 'undefined' ? priority : '';
  style.setProperty(styleName, value, priority);
  return $el.get(0).style;
};

function createTextEl(a) {
  return document.createTextNode(a)
}
function createEl(a, b, c) {
  var d = document.createElement(a);
  for (var e in b) if (b.hasOwnProperty(e)) d.setAttribute(e, b[e]);
  if (c) d.innerHTML = c;
  return d
}
function HtmlUnicodeDecode(a){
  var b="";if(a==null){return(b)}
  var l=a.length;
  for(var i=0;i<l;i++){
    var c=a.charAt(i);
    if(c=='&'){
      var d=a.indexOf(';',i+1);
      if(d>0){
        var e=a.substring(i+1,d);
        if(e.length>1&&e.charAt(0)=='#'){
          e=e.substring(1);
          if(e.charAt(0).toLowerCase()=='x'){c=String.fromCharCode(parseInt('0'+e))}else{c=String.fromCharCode(parseInt(e))}
        }else{
          switch(e){case"nbsp":c=String.fromCharCode(160)}
        }i=d;
      }
    }b+=c;
  }return b;
};
function do_an_e(A) {
  if (!A) {
    window.event.returnValue = false;
    window.event.cancelBubble = true;
    return window.event
  } else {
    A.stopPropagation();
    A.preventDefault();
    return A
  }
}
function selectAll(e){
  e = e.target||e;
  if(typeof(e)!='object') return false;
  e.setSelectionRange(0, e.value.length );
}

function getHeight(){
  var y = 0;
  if (self.innerHeight){ // FF; Opera; Chrome
    y = self.innerHeight;
  } else if (document.documentElement && document.documentElement.clientHeight){ 
    y = document.documentElement.clientHeight;
  } else if (document.body){
    y = document.body.clientHeight;
  }
  return y;
};
function getCurrentYPos() {
  if (document.body && document.body.scrollTop)
    return document.body.scrollTop;
  if (document.documentElement && document.documentElement.scrollTop)
    return document.documentElement.scrollTop;
  if (gvar.$w.pageYOffset)
    return gvar.$w.pageYOffset;
  return 0;
}

function getValue(key, cb) {
  var ret, data=OPTIONS_BOX[key];
  if( !data ) return;
  setTimeout(function(){
    ret = GM_getValue(key,data[0]);
    if(typeof(cb)=='function')
      cb(ret);
    else if(cb)
      cb = ret;
    else
      return ret;
  }, 0);
}
function setValue(key, value, cb) {
  var ret, data=OPTIONS_BOX[key];
  if( !data ) return;
  setTimeout(function(){
    try{
      ret = GM_setValue(key,value)
      if(typeof(cb)=='function')
        cb(ret);
      else if(cb)
        cb = ret;
      else
        return ret;
    }catch(e){ clog(e.message) }
  }, 0);
}
function delValue(key, cb){
  try{
    setTimeout(function() {
      ret = GM_deleteValue( key );
      if( typeof(cb)=='function' )
        cb(ret);
    }, 0);
  }catch(e){}
}

function setValueForId(userID, value, gmkey, sp){
  if( !userID ) return null;
  
  sp = [(isDefined(sp) && typeof(sp[0])=='string' ? sp[0] : ';'), (isDefined(sp) && typeof(sp[1])=='string' ? sp[1] : '::')];
  var i, ksg = KS+gmkey, info;
  getValue(ksg, function(val){
    info = val;
    if( !info ){
      setValue(ksg, userID+"="+value);
      return;
    }
    info = info.split( sp[0] );
    for(i=0; i<info.length; i++){
      if(info[i].split('=')[0]==userID){
        info.splice(i,1,userID+"="+value);
        setValue(ksg, info.join(sp[0]));
        return;
      }
    }
    
    info.splice(i, 0, userID+"="+value);
    setValue(ksg, info.join(sp[0]));
  });
}

// values stored in format "userID=value;..."
// sp = array of records separator
// gvar.user.id, 'LAYOUT_TPL', ['<!>','::'], function
function getValueForId(userID, gmkey, sp, cb){
  if( !userID ) return null;
  clog(gmkey + ' inside');
  
  sp = [(isDefined(sp) && typeof(sp[0])=='string' ? sp[0] : ';'), (isDefined(sp) && typeof(sp[1])=='string' ? sp[1] : '::')];    
  var info, capsulate_done=0, retValue=null;
  getValue(KS + gmkey, function(val){
    if( !val ) {
      
      clog(gmkey + ' halted');
      
      retValue = null;
      capsulate_done = 1;
      return;
    }
    info = val.split( sp[0] );
    clog(gmkey + ' info=' + info);
    
    for(var i=0; i<info.length; i++){
      if( !isString(info[i]) ) continue;
      var recs = info[i].split('=');
      if( recs[0]==userID ){
        var rets = [userID], values = recs[1].split(sp[1]), vL=values.length;
        for(var idx=0; idx<vL; idx++){
          if( !isString(values[idx]) ) continue;
          rets.push(values[idx]);
        }
        retValue = rets;
        break;
      }
    }
    capsulate_done = 1;
    if( rets ) retValue = rets;
    if( typeof cb == 'function' ) cb( retValue );
  });
  
  var waitTillDone = function(){
    if( !capsulate_done ){
      gvar.$w.setTimeout(function(){ waitTillDone() }, 1)
    }else{}
  };
  waitTillDone();
}
function delValueForId(userID, gmkey){
  var ksg = KS+gmkey, tmp=[], info = getValue(ksg);
  info = info.split(';');
  for(var i=0; i<info.length; i++){
    if(info[i].split('=')[0]!=userID)
      tmp.push(info[i]);    
  }
  setValue(ksg, tmp.join(';'));
}


// play safe with Opera, it really suck so need this emulator of GM
//=== BROWSER DETECTION / ADVANCED SETTING
//=============snipet-authored-by:GI-Joe==//
function ApiBrowserCheck() {
  //delete GM_log; delete GM_getValue; delete GM_setValue; delete GM_deleteValue; delete GM_xmlhttpRequest; delete GM_openInTab; delete GM_registerMenuCommand;
  if(typeof(unsafeWindow)=='undefined') { unsafeWindow=window; }
  if(typeof(GM_log)=='undefined') { GM_log=function(msg) { try { unsafeWindow.console.log('GM_log: '+msg); } catch(e) {} }; }
  
  var needApiUpgrade=false;
  if(window.navigator.appName.match(/^opera/i) && typeof(window.opera)!='undefined') {
    needApiUpgrade=true; gvar.isOpera=true; GM_log=window.opera.postError; clog('Opera detected...',0);
  }
  if(typeof(GM_setValue)!='undefined') {
    var gsv; try { gsv=GM_setValue.toString(); } catch(e) { gsv='.staticArgs.FF4.0'; }
    if(gsv.indexOf('staticArgs')>0) {
      gvar.isGreaseMonkey=true; gvar.isFF4=false;
      clog('GreaseMonkey Api detected'+( (gvar.isFF4=gsv.indexOf('FF4.0')>0) ?' >= FF4':'' )+'...',0); 
    } // test GM_hitch
    else if(gsv.match(/not\s+supported/)) {
      needApiUpgrade=true; gvar.isBuggedChrome=true; clog('Bugged Chrome GM Api detected...',0);
    }
  } else { needApiUpgrade=true; clog('No GM Api detected...',0); }
  
  gvar.noCrossDomain = (gvar.isOpera || gvar.isBuggedChrome);
  if(needApiUpgrade) {
    //gvar.noCrossDomain = gvar.isBuggedChrome = 1;
    clog('Try to recreate needed GM Api...',0);
    //OPTIONS_BOX['FLASH_PLAYER_WMODE'][3]=2; OPTIONS_BOX['FLASH_PLAYER_WMODE_BCHAN'][3]=2; // Change Default wmode if there no greasemonkey installed
    var ws=null; try { ws=typeof(unsafeWindow.localStorage) } catch(e) { ws=null; } // Catch Security error
    if(ws=='object') {
      clog('Using localStorage for GM Api.',0);
      GM_getValue=function(name,defValue) { var value=unsafeWindow.localStorage.getItem(GMSTORAGE_PATH+name); if(value==null) { return defValue; } else { switch(value.substr(0,2)) { case 'S]': return value.substr(2); case 'N]': return parseInt(value.substr(2)); case 'B]': return value.substr(2)=='true'; } } return value; };
      GM_setValue=function(name,value) { switch (typeof(value)) { case 'string': unsafeWindow.localStorage.setItem(GMSTORAGE_PATH+name,'S]'+value); break; case 'number': if(value.toString().indexOf('.')<0) { unsafeWindow.localStorage.setItem(GMSTORAGE_PATH+name,'N]'+value); } break; case 'boolean': unsafeWindow.localStorage.setItem(GMSTORAGE_PATH+name,'B]'+value); break; } };
      GM_deleteValue=function(name) { unsafeWindow.localStorage.removeItem(GMSTORAGE_PATH+name); };
    } else if(!gvar.isOpera || typeof(GM_setValue)=='undefined') {
      clog('Using temporarilyStorage for GM Api.',0); gvar.temporarilyStorage=new Array();
      GM_getValue=function(name,defValue) { if(typeof(gvar.temporarilyStorage[GMSTORAGE_PATH+name])=='undefined') { return defValue; } else { return gvar.temporarilyStorage[GMSTORAGE_PATH+name]; } };
      GM_setValue=function(name,value) { switch (typeof(value)) { case "string": case "boolean": case "number": gvar.temporarilyStorage[GMSTORAGE_PATH+name]=value; } };
      GM_deleteValue=function(name) { delete gvar.temporarilyStorage[GMSTORAGE_PATH+name]; };
    }
    if(typeof(GM_openInTab)=='undefined') { GM_openInTab=function(url) { unsafeWindow.open(url,""); }; }
    if(typeof(GM_registerMenuCommand)=='undefined') { GM_registerMenuCommand=function(name,cmd) { GM_log("Notice: GM_registerMenuCommand is not supported."); }; } // Dummy
    if(!gvar.isOpera || typeof(GM_xmlhttpRequest)=='undefined') {
      clog('Using XMLHttpRequest for GM Api.',0);
      GM_xmlhttpRequest=function(obj) {
      var request=new XMLHttpRequest();
      request.onreadystatechange=function() { if(obj.onreadystatechange) { obj.onreadystatechange(request); }; if(request.readyState==4 && obj.onload) { obj.onload(request); } }
      request.onerror=function() { if(obj.onerror) { obj.onerror(request); } }
      try { request.open(obj.method,obj.url,true); } catch(e) { if(obj.onerror) { obj.onerror( {readyState:4,responseHeaders:'',responseText:'',responseXML:'',status:403,statusText:'Forbidden'} ); }; return; }
      if(obj.headers) { for(name in obj.headers) { request.setRequestHeader(name,obj.headers[name]); } }
      request.send(obj.data); return request;
    }; }
  } // end needApiUpgrade
  GM_getIntValue=function(name,defValue) { return parseInt(GM_getValue(name,defValue),10); };
}

// ----my ge-debug--------
function show_alert(msg, force) {
  if(arguments.callee.counter) { arguments.callee.counter++; } else { arguments.callee.counter=1; }
  GM_log( ["string", "number"].indexOf(typeof msg) !== -1 ? '('+arguments.callee.counter+') '+msg : msg );

  if(force==0) { return; }
}
function clog(msg) {
  if( !gvar.__DEBUG__ ) return;
  var isPlain = (["string", "number"].indexOf(typeof msg) !== -1);
  var msgStr = (isPlain ? '[QR:dbg] '+msg : msg);
  if( !isPlain )
    show_alert('[QR:dbg] '+typeof msg);

  show_alert(msgStr);
}

//=== functions ===

// tokcap_parser
// parse given html page
// @param page String of html page
// return rets Array of [humanverify[hash], securitytoken]
function tokcap_parser(page){
  try{
    page = decodeURIComponent( page );
  }catch(e){    
    
    page = page.replace(/\\\"/g, '').replace(/(\r\n|\n|\r|\t|\s{2,})/gm, "").replace(/\%/gm, '%25').toString();
    
    clog('decodeURI in tokcap_parser failed');
    clog('secondary result of page = ' + page)    
  }
  
  /*
  * never get through this page; nor token is exist there;
  * assume it's alrite
  */
  if(page.match(/<meta\s*http\-equiv=[\"\']REFRESH[\"\']\s*content=[\"\']\d+;\s*URL=([^\"\']+)/i)){
    return 1;
  }
  
  var cucok=null, rets=[0,0];
  if(cucok = /out\/?\??\&?hash=([^\'\"]+)/i.exec(page) ){
    
    clog('old securitytoken=' + gvar._securitytoken);

    rets[1] = cucok[1];
    gvar._securitytoken = rets[1];
    $('#qr-securitytoken').val(gvar._securitytoken);

    clog('\n'
      +'securitytoken updated = ' + gvar._securitytoken 
      +'\n'
      +'securitytoken onfield = ' + $('#qr-securitytoken').val()
      +'\n'
    );
  }else{
    clog('Page is not containing securitytoken, update failed');
    clog('sdata - page='+page);
  }
  
  if( /recaptcha_response_field/i.test(page) ){

    // recaptcha autodetect | force gvar.settings.recaptcha value  
    gvar.settings.recaptcha = true;
    clog('Forced gvar.settings.recaptcha ON');
  }
  
  return (cucok ? rets : false);
}

function is_locked(data){
  var ret, $wrap = $(data);
  return $wrap.find('#message-wrapper .message').text();
}


/**
* the callback after append and remove item from preview list of images
* @param
*  options.mode String of task todo ['','delete']
*  options.parent_selector String of parent wrapper
*  options.preview_wrap_selector String of wrapper
*  options.item_class String of unit item image
*/
function inteligent_width(options){
  var $wraper_custom, mode = (options.mode ? options.mode : '');
  var $parent = $(options.parent_selector);
  var $preview_wrap = $parent.find(options.preview_wrap_selector);

  // inteligent width-adjustment
  return gvar.$w.setTimeout(function(){
    var $ct, upkey, itemclass, imgs=[];
    itemclass = (options.item_class ? options.item_class : 'preview-image-unit');
    $ct = $parent.find('.clickthumb');
    leb = parseInt( $parent.find('.'+itemclass).length );
    if( leb > 0 ) 
      $ct.show();
    else
      $ct.hide();

    var adjust_parent_selector_width = function(imgs_){
      if( imgs_ && imgs_.length )
        $preview_wrap.css('width',  (imgs_.length * 60));
    };

    // update log
    $preview_wrap.find('img').each(function(){
      imgs.push($(this).attr('src'));
    });
    
    upkey = (options.KEY_STR ? options.KEY_STR : 'UPLOAD_LOG');
    

    if( !mode ){ // firstload dom
      getValue(KS + upkey, function(ret){

        imgs = ret.split(',');
        adjust_parent_selector_width( imgs );

        if( ret && imgs.length > 0 ){
          var tpl='';
          $.each(imgs, function(){
            var _src = this;
            tpl += ''
              +'<div class="'+itemclass+'">'
              + '<img src="'+ _src +'" width="46" height="46" alt="[IMG]'+ _src +'[/IMG]" />'
              + '<span title="remove" class="kqr-icon-close imgremover"/>'
              +'</div>'
            ;
          });
          clog(tpl);
          $preview_wrap.prepend( tpl );
        }
      });
    }else{
      // whether is [insert, delete]
      imgs = imgs.reverse();
      setValue(KS + upkey, String(imgs));

      adjust_parent_selector_width( imgs );
    }
  }, 10);
}

/**
* remove all log uploader of given key_save
*/
function remove_log_uploader(options){
  if( !options.KEY_STR ) return;
  if( confirm('Agan yakin mau delete semua gambar ini?') ){
    setValue(KS + options.KEY_STR, '');

    var $parent = $(options.parent_selector);
    $parent.find(options.preview_wrap_selector).html('');
    $parent.find('.clickthumb').hide();
  }
}

function clear_quoted($el){
  do_click($('#qr_remoteDC').get(0));
  $('a[data-btn="multi-quote"].btn-orange').removeClass('btn-orange active');
  clog("class removed...? btn-orange active");

  $el.length && $el.addClass('events');
  _NOFY.dismiss();
}

function precheck_quoted( injected ){
  var cb_after, no_mqs = !($('*[data-btn="multi-quote"][class*=active]').length || $('*[data-btn="multi-quote"][class*=btn-orange]').length);
  clog("inside precheck_quoted, no_mqs="+no_mqs+'; injected='+injected);

  if( !injected && no_mqs ){

    _NOFY.dismiss(); return;
  }

  cb_after = function(){
    $('#notify_msg .btn-dismiss').click(function(){
      clear_quoted($(this))
    });
    var mq_ids = $("#tmp_chkVal").val().split(',');
    $.each(mq_ids, function(){
      if( !$('#mq_' + this).hasClass('btn-orange') )
        $('#mq_' + this).addClass('btn-orange');
    });
  };

  _NOFY.init({
    mode: 'quote',
    msg: 'You have selected one or more posts, <a id="sdismiss_quote" class="btn-dismiss" href="javascript:;">dismiss</a>',
    cb: cb_after,
    btnset: true,
    no_quickquote: no_mqs
  });
}

function close_popup(){
  // hacky to avoid broken rc2 when iframe is being destroyed
  $('body').trigger('click');

  try {
    gvar.sTryEvent.abort();
    gvar.sTryRequest.abort();
    if(gvar.$w.stop !== undefined) gvar.$w.stop();
    if(gvar.buftxt) delete( gvar.buftxt );
    else if(document.execCommand !== undefined){document.execCommand("Stop", false)}
  } catch (e) {}
  

  if( !gvar.user.isDonatur ){
    if( gvar.is_solvedrobot = ($('#kqr_recaptcha2').find("[name=g-recaptcha-response]").val() ? true : false) )
      $("#sbutton").removeClass("goog-btn-red").addClass("goog-btn-primary");

    if( _BOX.e.observer )
      _BOX.event_recaptcha_watch( !1 );
  }
    
  $('#'+_BOX.e.dialogname).css('visibility', 'hidden');
  $('body > .kqr-dialog-base:not(#wrap-recaptcha_dialog)').remove();

  // hide recaptcha dialog, instead of destroy it
  $('#wrap-recaptcha_dialog').addClass("ghost");

  $('body').removeClass('hideflow');
  $('#'+gvar.tID).focus();
}

// action to do insert smile
function do_smile(Obj, nospace){
  var bbcode, iskplus, _src, tagIMG='IMG';
  
  _TEXT.init();
  bbcode = Obj.attr("alt");
  
  if(bbcode && bbcode.match(/_alt_.+/)) {
    // custom mode using IMGtag instead
    _src=Obj.attr("src");
    _TEXT.setValue( '['+tagIMG+']'+_src+'[/'+tagIMG+']' + (!nospace ? ' ':''));
  }else if( Obj.get(0).nodeName != tagIMG ) {
    bbcode=Obj.attr("title");
    _src = bbcode.split(' ' + HtmlUnicodeDecode('&#8212;'));
    _TEXT.setValue( _src[1] + (!nospace ? ' ':''));  
  }else{
    // either kecil, besar, kplus smilies

    // intervene to force use img-bbcode on particular condition
    iskplus = Obj.attr('data-kplus');
    if( gvar.settings.kaskusplus_bbcode_img && 'undefined' != typeof iskplus && iskplus ){
      _src=Obj.attr("src");
      _TEXT.setValue( '['+tagIMG+']'+_src+'[/'+tagIMG+']' + (!nospace ? ' ':''));
    }
    else
    _TEXT.setValue(bbcode + (!nospace ? ' ':'') );
  }
  _TEXT.pracheck();
}


// action to insert BBcode:
//  [FONT, COLOR, SIZE]
function do_insertTag(tag, value, $caleer){
  _TEXT.init();
  if( value )
    _TEXT.wrapValue(tag, value);
  else
    _TEXT.wrapValue(tag);

  if( ($.inArray(tag, ["FONT","COLOR","SIZE"]) != -1) && $caleer && $caleer.length ){
    $caleer.closest('ul').hide();
  }
}


// action to insert BBCode:
//  [IMG,CODE,INDENT,QUOTE,CODE,PHP,HTML,URL,SPOILER,NOPARSE,YOUTUBE]
// Including mod to [Transparent, Strikethrough]
function do_insertCustomTag($el){
  _TEXT.init();
  
  var BBCode = ( "string" !== typeof $el && $el  ? $el.attr("data-bb") : $el );
  var text, prehead, tagprop, ptitle, selected, ret, prmpt;
  var wrapped_bb = 'INDENT,QUOTE,CODE,HTML,PHP'.split(",");

  var endFocus = function(){ _TEXT.focus(); return};
  if("undefined" == typeof BBCode) return endFocus();


  selected = _TEXT.getSelectedText();
  tagprop = '';

  if( wrapped_bb.indexOf(BBCode) !== -1 )
    _TEXT.wrapValue( BBCode );
  else{
    switch(BBCode){
      case "SPOILER":
        prmpt = prompt('Enter the TITLE of your Spoiler:', '' );
        prmpt = (prmpt ? prmpt : ' ');
        _TEXT.wrapValue(BBCode, prmpt);
      break;
      case "STRIKE":
        var strikeEm = function(_text){
          var chrs = _text.split(''), r='';
          for(var i=0, iL=chrs.length; i<iL; i++) 
            r += chrs[i]+'\u0336';
          return String(r)
        };

        text = (!selected ? prompt('Enter Text to strikethrough:', 'coret-di-sini') : selected);

        ret = (text ? strikeEm(text) : "");
        prehead = [0, text.length*2];
        if( !selected )
          _TEXT.setValue( ret, prehead );
        else
          _TEXT.replaceSelected( ret, prehead );

        return endFocus();
      break;
      default:
        // BB Handler:
        //  [URL,IMG, EMAIL,NOPARSE,TRANSPARENT, YOUTUBE,VIMEO,SOUNDCLOUD]
        
        var noPrompts = 'TRANSPARENT,NOPARSE,EMAIL'.split(",");
        var is_mediaembed = function(media, text){
          var rx, rxNaCd;
          text = trimStr ( text );

          switch(media){
            case "YOUTUBE":
              rx = text.match(/\byoutube\.com\/(?:watch\?v=)?(?:v\/)?([^&]+)/i);
              rxNaCd = !/^[\d\w-]+$/.test(text);
            break;
            case "SOUNDCLOUD":
              rx = text.match(/\bsoundcloud\.com\/tracks\/(\d+)/i);
              rxNaCd = !/^[\d\w]+$/.test(text);
            break;
            case "VIMEO":
              rx = text.match(/\bvimeo\.com\/(\d+)/i);
              rxNaCd = !/^[\d\w]+$/.test(text);
            break;
          }

          if( rx && rx[1] )
            text = rx[1];
          else if( rxNaCd )
            text = null;
          return text;
        };
        var is_youtube_link = function(text){
          var rx;
          text = trimStr ( text );
          clog( text);
          
          if( rx = text.match(/\byoutube\.com\/(?:watch\?v=)?(?:v\/)?([^&]+)/i) ){
            text = ( rx ? rx[1] : '');
          }else if( !/^[\d\w-]+$/.test(text) )
            text = false;

          clog("ytlink? text="+text);
          return text;
        };
        var get_prompt_text = function(BBCode_){
          var ret = {tagprop:'', text:''};

          switch(BBCode){
            case 'URL':
              ret.text = prompt('Please enter the URL of your link:', 'http://');
              ret.tagprop = ret.text;
            break;
            case 'IMG':
              ret.text = prompt('Please enter the URL of your image:', 'http://');
            break;
            case 'YOUTUBE':
              ret.text = prompt('Please enter the Youtube URL or just the ID, \nhttp:/'+'/www.youtube.com/watch?v=########', '');
            break;
            case 'VIMEO':
              ret.text = prompt('Please enter Vimeo URL Link, \nhttps:/'+'/vimeo.com/#######', '');
            break;
            case 'SOUNDCLOUD':
              ret.text = prompt('Please enter [Soundcloud widget code, ID, API-URL]\neg.https:/'+'/api.soundcloud.com/tracks/#######', '');
            break;
          }
          return ret;
        };
        

        if( !selected ){

          var prompt_text = get_prompt_text(BBCode);
          text = prompt_text.text;
          tagprop = prompt_text.tagprop;

          if( !text && noPrompts.indexOf(BBCode) === -1 ){

            return endFocus();
          }else{
            // good-togo
            if( noPrompts.indexOf(BBCode) !== -1 ){
              if( BBCode=='TRANSPARENT' ){
                tagprop = BBCode;
                BBCode = "COLOR";
              }
            }
            else{
              if( ['YOUTUBE','SOUNDCLOUD','VIMEO'].indexOf(BBCode) !== -1 ){
                text = is_mediaembed(BBCode, text);
                text = (text ? text : null);
              }else if(BBCode=='URL' || BBCode=='IMG')
                text = (isLink(text) ? text : null);

              // prompting text check...
              if(text==null) return endFocus();
            }

            prehead = [('['+BBCode + (tagprop!=''?'='+tagprop:'')+']').length, 0];
            prehead[1] = (prehead[0]+text.length);
            _TEXT.setValue( '['+BBCode + (tagprop!=''?'='+tagprop:'')+']'+text+'[/'+BBCode+']', prehead );
          }
          return endFocus();
        } // end selected==''
        else{
          text = selected;

          // precheck of this BBCode upon selection if selected is a proper link
          if( ["URL","IMG"].indexOf(BBCode) !== -1 ){
            tagprop = (BBCode == 'URL' ? trimStr(text) : '');
          
            var autotrim_selected = trimStr( selected );

            if( !isLink(autotrim_selected, true) ){
              var prompt_text = get_prompt_text(BBCode);
              text = prompt_text.text;
              tagprop = prompt_text.tagprop;

              text = (text ? trimStr(text) : null);
              if( BBCode == 'IMG' )
                selected = (text ? text : selected);
            }
            if(text==null) return endFocus();

            prehead = [('['+ BBCode + (tagprop!=''?'='+tagprop:'')+']').length, 0];
            prehead[1] = (prehead[0]+selected.length);
            _TEXT.replaceSelected(
              '['+BBCode + (tagprop!=''?'='+tagprop:'')+']'+selected+'[/'+BBCode+']',
              prehead
            );
            return endFocus();
          }
          else{
            if( BBCode == 'TRANSPARENT' ){
              tagprop = BBCode;
              BBCode = "COLOR";
            }

            _TEXT.wrapValue( BBCode, (tagprop!='' ? tagprop:'') );
          }
        }
      break;
    }
  }
}

// action to insert BBcode:
//  [B,I,U, LEFT, CENTER, RIGHT]
function click_BIU($el){
  var BBCode = ( "string" !== typeof $el && $el  ? $el.attr("data-bb") : $el );
  var endFocus = function(){ _TEXT.focus(); return};

  if("undefined" == typeof BBCode) return endFocus();

  _TEXT.init();
  _TEXT.wrapValue( BBCode, '' );
  _TEXT.pracheck();
  return !1;
}

// event watch for window scroll vs position of markItUp top position
function fixed_markItUp(){
  // shorthand for .XKQR wrapper
  var $target, $XK = $("#"+gvar.qID);
  var $editor = $XK.find("#"+gvar.tID);
  var eH = $editor.height();
  var treshold_minHeight_editor = 82; // def: 82
  var treshold_fixed_top = 0;
  var fixed_reset = function(){
    $XK.removeClass("fixed_markItUp");
    $XK.find(".markItUpContainer").css("width", "auto");
  };

  // clog("tick eH="+eH+'; treshold_minHeight_editor='+treshold_minHeight_editor);
  if( eH >= treshold_minHeight_editor ){

    var $ustick = $(".navbar-fixed-top").first(),
      isus = ($ustick.is(":visible") && $ustick.css("position") == 'fixed'),
      ustickFixPos = {top:0}, ustickH = 0,
      tgtH, sTop, tgtTop;
    
    sTop = $(window).scrollTop();
    $target = $XK.find("#markItUpReply-messsage");
    tgtH = $target.height();
    
    ustickH = (isus ? ($ustick.height() + $ustick.position().top) : $(".site-header.navbar-fixed-top").height());
    tgtTop = $target.offset().top - ustickH - treshold_fixed_top/2;

    if( (tgtTop + tgtH) <= sTop && (tgtTop + $XK.find("#"+gvar.tID).height() - treshold_minHeight_editor) > sTop ){
      if( !$XK.hasClass("fixed_markItUp") ){

        tgtL = $target.offset().left;

        $XK.addClass("fixed_markItUp");
        $XK.find(".markItUpContainer")
          .css("top", ustickH + (isus ? treshold_fixed_top : 0)) //treshold_fixed_top
          .css("left", tgtL)
          .css("width", $target.width())
      }
    }
    else{
      if( $XK.hasClass("fixed_markItUp") )
        fixed_reset()
    }

    // tick lastY
    if("undefined" == typeof gvar.lastYpos){
      gvar.lastYpos = getCurrentYPos();
      clog("lastYpos-new="+gvar.lastYpos);
    }
    else{
      var lastYpos = getCurrentYPos();
      if( lastYpos != gvar.lastYpos ){

        gvar.lastYpos = lastYpos;
        clog("lastYpos-upd="+gvar.lastYpos);
      }
    }
  }
  else{
    if( $XK.hasClass("fixed_markItUp") )
      fixed_reset()
  }
}

// main element events, 
// elements mostly on toolbar
function eventsController(){
  // shorthand for .XKQR wrapper
  var $XK = $("#"+gvar.qID);

  $XK.find('#form-title').focus(function(){
    var T=$(this), par = T.parent();
    if( par.attr('class').indexOf('condensed')!=-1 ){
      par.removeClass('condensed');
      T.val('');
    }
  }).blur(function(){
    var T=$(this), par = T.parent();
    if( trimStr( T.val() )=="" ){
      T.val( gvar.def_title );
      par.addClass('condensed');
    }
  }).keydown(function(ev){
    if(ev.keyCode==9)
      gvar.$w.setTimeout(function(){ $('#'+gvar.tID).focus() }, 50);
  }).keyup(function(){
    if ($(this).val() != "") $("#close_title").show();
    else $("#close_title").hide()
  });

  $XK.find("#pick_icon").click(function () {
    gvar.$w.clearTimeout(gvar.sTryEvent);
    $("#menu_posticon").slideToggle(81, function () {
      var editmode = $('.edit-options').is(':visible');
      if ($("#menu_posticon").is(":visible")){
        editmode && $('.edit-options .add-on').css('visibility', 'hidden');
        $("#fakefocus_icon").focus();
      }else{
        editmode && $('.edit-options .add-on').css('visibility', 'visible');
        $("#form-title").focus()
      }
    })
  });
  $XK.find("#fakefocus_icon").blur(function () {
    if( $("#menu_posticon").is(":visible") )
      gvar.sTryEvent = gvar.$w.setTimeout(function () {
        do_click($('#pick_icon').get(0));
      }, 200)
  });
  
  $XK.find("#menu_posticon li a").each(function () {
    $(this).click(function () {
      var $tgt, $me = $(this);
      var img = $me.find("img");
      $tgt = $("#img_icon");
      $("#hid_iconid").prop("checked", true);
      $("#hid_iconid").val( $me.attr("data-id") );
      if( img.length == 0 ){
        $tgt.closest(".modal-dialog-title-pickicon").removeClass("selected");
        $tgt.hide();
        return
      }

      // assign icon
      $tgt
        .attr("src", img.attr("src"))
        .attr("title", $me.attr("title"))
        .show();
      $tgt.closest(".modal-dialog-title-pickicon").addClass("selected");
    })
  });
  $XK.find("#close_title").click(function () {
    $("#form-title").val("").focus();
    $("#close_title").hide()
  });
  
  // menus
  $XK.find('#mnu_add_title').click(function(){
    if( !$XK.find('.ts_fjb-type').is(':visible') ){

      var is_visb = $XK.find('#kqr-title_message').is(":visible");
      if( !is_visb ){
        $XK.find('#kqr-title_message').show();
        $("#hid_iconid", $XK).val(0);
        $("#img_icon", $XK).attr("src", "#").hide();
        $("#form-title", $XK).val("");
        $("#close_title", $XK).hide()
      }else{
        $XK.find('#kqr-title_message').hide();
        $("#form-title", $XK).focus()
      }
      $("#hid_iconid", $XK).prop("checked", true)
    }
  });
  
  // render font's fonts
  $XK.find('.fonts ul li a').each(function(){
    var $me = $(this);
    $me.css('font-family', $me.attr('title'));
  });
    
  // main-controller
  clog("events for markItUpButton a");
  $XK.find('.markItUpButton a').each(function(){
    var par, $el = $(this), _cls = $el.attr('class');
    if( _cls && _cls.indexOf('ev_') == -1 || "undefined" == typeof _cls)
      return true;

    // good-togo
    par = $el.parent();
    _cls = _cls.replace(/ev_/,'');
    var tag, title, pTag;

    //click_BIU, do_insertCustomTag
    switch(_cls){
      case "biu": case "align":
        $el.click(function(){

          return click_BIU( $(this) );
        });
      break;

      case "list":
        $el.click(function(){
          _TEXT.init();
          var $me = $(this);
          var nn, buff, mode, selected, title, prmpt, BBCode, startFrom;
          var BBCodePart = $me.attr("data-bb"); // LIST-[numeric,bullet]
          BBCodePart && (BBCodePart = BBCodePart.split("-"));
          nn = "\n";

          if( BBCodePart.length ){
            BBCode = BBCodePart[0];
            mode = BBCodePart[1];
          }
          if( mode == 'numeric' ){
            startFrom = 1;
            if( prmpt = prompt("Starting number of Numeric List") ){
              startFrom = (prmpt ? parseInt(prmpt) : "1");
              if( isNaN(startFrom) )
                startFrom = 1;
            }
          }
          clog("startFrom="+startFrom);

          selected = _TEXT.getSelectedText();
          if( !selected ){
            var reInsert = function(pass){
              _TEXT.init();
              buff = "";

              if( prmpt = prompt("Enter a list item.\nLeave the box empty or press 'Cancel' to complete the list:") ){
                if( "undefined" == typeof pass )
                  buff += nn;

                buff += '[*]' + prmpt+nn;
                _TEXT.setValue(buff);
                reInsert( true );
              }else
                return !1;
            };

            do_insertTag(BBCode, (mode=='numeric' ? startFrom : !1) );
            gvar.$w.setTimeout(function(){ reInsert() }, 10);
          }
          else{
            
            buff = '';
            var lines = selected.split('\n');
            for(var i=0, iL=lines.length; i<iL; i++)
              if( trimStr(lines[i]) )
                buff+= nn + '[*]' + lines[i] + '';

            buff = '[LIST'+(mode=='numeric' ? '="'+parseInt(startFrom)+'"' : '')+']' + buff +nn+'[/LIST]';
            _TEXT.replaceSelected( buff, [0, buff.length] );
          }
        });
      break;

      case "font": case "size": case "color":
        $el.click(function(){
          var $me = $(this);
          do_insertTag(
            $me.closest("ul").attr("data-bb"),
            $me.attr('title'),
            $me
          );
          _TEXT.pracheck();
          
          // avoid dropdown being set undisplayed
          setTimeout(function(){
            $me.closest("ul").css("display", "");
          }, 50)
        });
      break;

      case "custom": case "indent":
        $el.click(function(){
          do_insertCustomTag( $(this) );
          
          _TEXT.pracheck();
        });
      break;

      case "smiley":
        $el.click(function(){
          var $boxSM = $XK.find('.box-smiley'), tgt_autoload = null;

          if(gvar.settings.autoload_smiley[0] == 1)
            tgt_autoload = gvar.settings.autoload_smiley[1];

          if( !$boxSM.is(':visible') ){
            if( !$boxSM.hasClass('events') ){

              $boxSM.find('.nav.nav-tabs > li > a').each(function(){
                $(this).click(function(){
                  var tid, $me = $(this);
                  tid = $me.attr('href');
                  if( tid.indexOf("#") !== -1 ){
                  
                    // switch to sandboxed
                    _SML_.load_smiley(tid);
                  }else{
                    // must be close tab //close-tab
                    _SML_.toggletab(false);
                  }
                });
              });


              _SML_.init();
              $boxSM.addClass('events');
            }
            // not having events

            _SML_.toggletab(true);
            if(tgt_autoload && gvar.freshload)
              do_click( $boxSM.find('.nav.nav-tabs > li > a[href*="'+tgt_autoload+'"]').get(0) );
            else if( !$boxSM.find(".tab-content.tab-pane.active").length )
              do_click( $boxSM.find('.nav.nav-tabs > li').first().find("a").get(0) );
          }
          else{

            _SML_.toggletab(false);
          }
          
          !gvar.freshload &&
            _TEXT.focus();
        });
      break;

      case "upload":
        $el.click(function(){
          var $boxUP = $XK.find('.box-upload');
          if( !$boxUP.is(':visible') ){
            if( !$boxUP.hasClass('events') ){
              $boxUP.find('.nav.nav-tabs > li > a').each(function(){
                $(this).click(function(){
                  if( $(this).attr("href").indexOf("#") === -1 ){
                    // it must be close tab //close-tab
                    _UPL_.toggletab(false);
                  }
                });
              });

              _UPL_.init();
              $boxUP.addClass("events");
            }
            else{

              _UPL_.toggletab(true);
            }
          }
          else{

            _UPL_.toggletab(false);
          }
          _TEXT.focus();
        });
      break;
    } // end switch


    // flag hold fixed markItUp watcher
    $el.click(function(){
      gvar.sTryPreUnFixed_markItUp
        && clearTimeout( gvar.sTryPreUnFixed_markItUp );
    });
  });

  $XK.find('[data-noevent]').each(function(){
    $(this).click(function(){ _TEXT.focus() })
  })

  // scroll on click this in elastic editor on
  $XK.find(".markItUpContainer").click(function(e){
    if( !gvar.settings.fixed_toolbar ) return !1;
    $e = $(e.target||e);
    // data-noevent
    if( $XK.hasClass("fixed_markItUp") && ($e.hasClass("markItUpHeader") || $e.attr("data-noevent") == "1") ){
      // insist to focus, avoid timeout
      if( $e.attr("data-noevent") == "1" ){

        setTimeout(function(){
          $XK.find("#"+gvar.tID).focus();
        }, 1);
      }
      else{
        // do scroll to top of QR ..
        var params = {topPos: $XK.offset().top};

        var $ustick = $(".user-control-stick");
        if( $ustick.length && $ustick.is(":visible") )
          params.topPos = (params.topPos - $ustick.height() - $ustick.position().top + 10);
        else
          params.topPos = (params.topPos - 20);

        slideAttach(
          $XK.closest(".ajax_qr_area").prev().find(".button_qr").get(0),
          function(){},
          params
        );
      }
    }
  });
}

// event trigger right after start_main layouting
// elements: [sbutton, sadvanced, squote_post, editor, window]
function eventsTPL(){
  clog('inside eventsTPL');
  gvar.sTryEvent = null;

  // shorthand for .XKQR wrapper
  var $XK = $("#"+gvar.qID);
  
  $XK.find('#sbutton').click(function(ev){

    // bypass to avoid submission by click enter on any input element under form
    do_an_e(ev);
    var $form = $('#formform');
    if( $form.attr('ignoresubmit') ){
      $form.removeAttr('ignoresubmit');
      return !1;
    }

    _BOX.init(ev);
    _BOX.presubmit();
  });
  $XK.find('#sadvanced').click(function(ev){
    do_an_e(ev);
    if( $('#form-title').closest('div.condensed').length == 1 )
      $('#form-title').val("");
    $('#formform').submit();
  });
  $XK.find('#spreview').click(function(ev){
    do_an_e(ev);
    _BOX.init(ev);
    _BOX.preview();
  });
  $XK.find('#squote_post').click(function(){
    _AJAX.quote( $(this), function(){
      func = function(){
        gvar.sTryRequest && gvar.sTryRequest.abort();
      };
      _NOFY.init({msg:'Fetching... <a class="btn-dismiss" href="javascript:;">Dismiss</a>', cb:func, btnset:false});
    }, function(){
      var $him = $('#notify_msg .btn-dismiss');
      clear_quoted($him);
      _TEXT.lastfocus();
    });
  });

  $XK.find('#squick_quote').click(function(){
    _QQparse.init();
  });
  
  $XK.find('#scancel_edit').click(function(){ _AJAX.edit_cancel() });
  $XK.find('#clear_text').click(function(){
    _TEXT.set("");
    _TEXT.pracheck();
    _DRAFT.provide_draft()
    $(this).hide()
  });
  $XK.find('#qr_signsectok').click(function(){

    gvar.fetched_token_post = true;
    _BOX.submit();
  });
  $XK.find('#qr_getcont').click(function(){
    var $ifr = $("#ifr_content"), values = trimStr( $ifr.val() );

    if( values ){
      _TEXT.init();
      _TEXT.add( values + "\n\n" );
      _TEXT.pracheck();
      $ifr.val('');
    }
    do_click($(".btn-dismiss").get(0))
    clear_quoted( $('#notify_msg .btn-dismiss') );
  });
  $XK.find('#qr_chkval').click(function(){

    precheck_quoted( $('#tmp_chkVal').val() );
  });
  $XK.find('.ts_fjb-tags #form-tags').keydown(function(ev){
    var A = ev.keyCode || ev.keyChar;
    if(A === 9){
      do_an_e(ev);
      gvar.$w.setTimeout(function(){ $('#sbutton').focus() }, 50);
    }
  });
  $XK.find('.edit-reason #form-edit-reason').keydown(function(ev){
    var A = ev.keyCode || ev.keyChar;
    if(A === 9){
      do_an_e(ev);
      gvar.$w.setTimeout(function(){
        if( $('.ts_fjb-tags').is(':visible') )
          $('.ts_fjb-tags input[type="text"]:first').focus()
        else
          $('#sbutton').focus()
      }, 50);
    }
  });
  $XK.find('.additional_opt_toggle').click(function(){
    var $me = $(this);
    var $fg = $me.closest(".form-group");
    var $adt = $fg.find('#additionalopts');
    if( $adt.is(':visible') ){
      $adt.hide();
      $me.removeClass('active');
    }
    else{
      $adt.show();
      $me.addClass('active');
    }
  })

  $XK.find('#settings-button').click(function(){ _STG.init(); });

  // collect mnu datashortcut
  var DScuts = [];
  var regs_fn = {
    'click_BIU': click_BIU,
    'do_insertCustomTag': do_insertCustomTag,
  };
  var reserved_CSA;
  
  $XK.find('.markItUpHeader > ul > li.markItUpButton a[data-shortcut]').each(function(){
    var $me = $(this);
    var dumy, cls, dts = $me.attr("data-shortcut");
    if( dts && is_good_json(dts) ){
      dts = JSON.parse( dts );
      if( !dts.key ) return true;
      

      var kn, dCSA = (function(csa_){
        var dCSA_ = '';
        dCSA_ += (csa_.indexOf('ctrl') != -1 ? '1' : '0');
        dCSA_ += (csa_.indexOf('shift') != -1 ? '1' : '0');
        dCSA_ += (csa_.indexOf('alt') != -1 ? '1' : '0');
        return dCSA_;
      })(dts.csa);
      kn = String(dts.key.charCodeAt(0));

      dumy = {};
      dumy[dCSA+','+kn] = {
        kn: kn,
        bb: dts.key,
        el: $me,
        csa: dCSA,
        fn: (["ev_biu","ev_align"].indexOf($me.attr("class")) !== -1 ? "click_BIU" : "do_insertCustomTag")
      };
      DScuts.push( dumy );
    }
  });


  // preload global shortcut (window) to intercept in editor, if any
  var std_fn = function(){ scrollToQR() };
  var CSA_tasks = [
    { // default: Ctrl+Q
      name: 'quickreply',
      csa: gvar.settings.hotkeykey.toString()+'_'+gvar.settings.hotkeychar.charCodeAt(),
      fn: function(){ std_fn() }
    },
    { // Alt+Q [FF|Chrome] --OR-- Ctrl+Alt+Q [Opera]
      name: 'fetch',
      csa: (!gvar.isOpera ? '0,0,1' : '1,0,1')+'_'+'81',
      fn: function(){
        std_fn();
        do_click($('#squote_post').get(0));
      }
    },
    { // Alt+C [FF|Chrome] --OR-- Ctrl+Alt+Q [Opera]
      name: 'qq',
      csa: (!gvar.isOpera ? '0,0,1' : '1,0,1')+'_'+'67',
      fn: function(){
        std_fn();
        do_click($('#squick_quote').get(0));
      }
    },
    { // Ctrl+Shift+Q
      name: 'dismisquote',
      csa: '1,1,0'+'_'+'81',
      fn: function(){
        do_click($('#sdismiss_quote').get(0));
      }
    },
    { // Ctrl+Shift+D
      name: 'draft',
      csa: '1,1,0'+'_'+'68',
      fn: function(){
        if( !$('#qrdraft').hasClass('goog-btn-disabled') ){
          std_fn();
          do_click($('#qrdraft').get(0));
        }
      }
    },
  ];
  var CSA_index_reserved = {};
  for(var j=0, jL=CSA_tasks.length; j<jL; j++)
    CSA_index_reserved[CSA_tasks[j]["csa"]] = CSA_tasks[j]["fn"];

  

  // window events
  // global-window-shortcut
  $(window).keydown(function (ev) {
    var A = ev.keyCode, doThi=0, CSA_tasks, pCSA_Code, pCSA = (ev.ctrlKey ? '1':'0')+','+(ev.shiftKey ? '1':'0')+','+(ev.altKey ? '1':'0');

    // clog("input:"+pCSA+'_'+A);
    
    if( A == 27 ){
      if( $("#" + _BOX.e.dialogname).is(":visible") && $("#" + _BOX.e.dialogname).css('visibility')=='visible' ){
        close_popup();
        $("#" + gvar.tID).focus();
      }

      do_an_e(ev);
      return;
    }

    if( pCSA == '1,0,0' && A == 192 && gvar.readonly ){ // 192 for `: open the hive
      $('.button_qrmod,.button_qq,.xkqr').removeClass('hide');
      doThi = 1;
      scrollToQR();
    }

    // panic-button reset_settings then reload page
    // Ctrl+Shift+` = Panic Reset Settings
    if( pCSA == '1,1,0' && A == 192 ){ // 192 for `
      _STG.reset_settings( true );
      doThi = 1;
      return !1;
    }
    
    if( (pCSA=='0,0,0' || pCSA=='0,1,0') || A < 65 || A > 90 )
      return;
    


    if( !gvar.readonly ){

      pCSA_Code = pCSA+'_'+A;
      
      // comparing...
      if( "undefined" != typeof CSA_index_reserved[pCSA_Code] ){
        CSA_index_reserved[pCSA_Code]();
        doThi = 1;
      }
    }

    if( doThi ){
      do_an_e(ev);
      return !1;
    }
  }).resize(function () {

    resize_popup_container();
  });


  // editor events: [focus,blur,keydown,keyup]
  // assigning several action, eg. watch draft, fixed toolbar martItUp,
  $XK.find('#'+gvar.tID).focus(function(){
    if( gvar.settings.txtcount ){
      $XK.find('.counter').first().addClass('kereng');
      _TEXTCOUNT.init('#'+gvar.qID+' .counter')
    }

    // fixed_markItUp
    if( gvar.settings.fixed_toolbar ){
      clog("activating onfocus event");
      gvar.sTryWatchWinScroll &&
        clearInterval(gvar.sTryWatchWinScroll);
      gvar.sTryWatchWinScroll = setInterval(function(){
        fixed_markItUp()
      }, 50);
    }
  }).blur(function(){
    clog("blur editor, gvar.settings.txtcount="+gvar.settings.txtcount);
    if( gvar.settings.txtcount ){
      $XK.find('.counter').first().removeClass('kereng');
      _TEXTCOUNT.dismiss();
    }

    if( gvar.settings.fixed_toolbar ){
      if( gvar.sTryWatchWinScroll ){
        clog("deactivate onfocus event");
        clearInterval(gvar.sTryWatchWinScroll);

        gvar.sTryPreUnFixed_markItUp = setTimeout(function(){

          $XK.removeClass("fixed_markItUp");
        }, 789);
      }
    }
  }).keydown(function(ev){
    var B, pCSA_Code,
      A = ev.keyCode || ev.keyChar,
      pCSA = (ev.ctrlKey ? '1':'0')+','+(ev.shiftKey ? '1':'0')+','+(ev.altKey ? '1':'0');

    if(A === 9){
      do_an_e(ev);
      gvar.$w.setTimeout(function(){
        if( $XK.find('.edit-reason').is(':visible') )
          $XK.find('.edit-reason input[type="text"]:first').focus()
        else
          $XK.find('#sbutton').focus()
      }, 50);
    }
    
    // area kudu dg CSA
    if( (pCSA=='0,0,0' || pCSA=='0,1,0') || (A < 65 && (A!=13 && A!=9)) || A > 90 )
      return;

    pCSA_Code = pCSA+'_'+A;

    if( "undefined" != typeof CSA_index_reserved[pCSA_Code] ){
      clog("intercept global shortcut.");
      CSA_index_reserved[pCSA_Code]();
      return;
    }
    
    var asocKey = {
       '001,83':'sbutton'   // [Alt+S] Submit post
      ,'001,80':'spreview'  // [Alt+P] Preview
      ,'001,88':'sadvanced' // [Alt+X] Advanced
    };
    var ds, dsL = DScuts.length;
    if( dsL ){
      for(var j=0; j<dsL; j++){
        for(var kn in DScuts[j])
          asocKey[String(kn)] = {
            bb: DScuts[j][kn]["bb"],
            el: DScuts[j][kn]["el"],
            csa: DScuts[j][kn]["csa"],
            fn: DScuts[j][kn]["fn"]
          };
      }
    }


    // indexing keys
    var Acsa, fn, parts, indexedKeyNum = [13];
    for(var strKeyNum in asocKey){
      parts = strKeyNum.split(",");
      if( parts && parts[1] )
        indexedKeyNum.push(parseInt(parts[1]));
    }

    if(ev.ctrlKey){
      if( $.inArray( A, indexedKeyNum ) != -1 ){
        Acsa = '100,'+A;

        if(A===13){
          if( gvar.readonly )
            return;
          _BOX.init(ev);
          _BOX.presubmit();
        }else{

          if( asocKey[Acsa] && asocKey[Acsa]["csa"] == '100') {
            try{
              fn = regs_fn[ asocKey[Acsa]["fn"] ];
            }catch(e){ clog("ERR:"+e.message) }

            if( "function" === typeof fn ){
              fn( asocKey[Acsa]["el"] );
              do_an_e(ev);
            }
          }
        }
      }
    }else if(ev.altKey){
      if( gvar.readonly )
        return;

      Acsa = '001,'+A;
      do_an_e(ev);
      do_click( $XK.find('#' + asocKey[Acsa]).get(0));
    }
  }).keyup(function(ev){

    $XK.find('#clear_text').toggle( $(this).val()!=="" );
  });
    


  $XK.find('#qrtoggle-button').click(function(){
    $XK.find('#formqr').toggle(120, function(){
      toggleTitle();
      $XK.find('#'+gvar.tID).focus();
    });
  });


  if( gvar.settings.qrdraft ){
    $('#'+gvar.tID).keypress(function(e){
      var A = e.keyCode;
      if( A>=37 && A<=40 ) return; // not an arrow
      if( $('#qrdraft').get(0) )
        _TEXT.saveDraft(e);
      clearTimeout( gvar.sITryLiveDrafting );
      gvar.isKeyPressed=1; _DRAFT.quick_check();
    });
    
    // initialize draft check
    _DRAFT._construct();
    _DRAFT.check();

    // event click for save_draft
    $("#qrdraft").click(function(){
      var text, disb, $me=$(this);
      text = $('#'+gvar.tID).val();
      disb = 'goog-btn-disabled';
      if( $me.hasClass(disb) ) return;
      if( $me.attr('data-state') == 'idle' ){
        _TEXT.init();
        if( !text ){
          _TEXT.set( gvar.tmp_text );
          _TEXT.lastfocus();
        }
        else{
          _TEXT.add( gvar.tmp_text );
        }
        $('#draft_desc').html('');
        $me.text('Saved').attr('data-state', 'saved');
        _DRAFT.switchClass(disb);
        _TEXT.setElastic(gvar.maxH_editor, 1);
      }else{
        if( !text )
          _DRAFT.save();
      }
    });
  }

  if( !gvar.settings.txtcount )
    $XK.find('.counter').hide();
  
  eventsController();
  resize_popup_container(); // init to resize textarea
  _TEXT.setElastic(gvar.maxH_editor);

  // check if css_check defined
  (typeof gvar.on_demand_csscheck=='function')
    && gvar.on_demand_csscheck();
}

function get_userdetail($sparent) {
  clog("inside get_userdetail..");
  var a={}, b, $p, $c, $e, d;
  if("undefined" == typeof $sparent)
    $sparent = $('body');

  $p = $('#after-login', $sparent);
  $c = $p.find('#menu-accordion ul a[href*="/profile/about"]');
  $e = $p.find('>.dropdown-toggle');
  b = /\/profile\/aboutme\/(\d+)/.exec($c.attr('href'));
  d = /\b(http\:\/\/[^\'\"]+)/.exec($e.find('>.user-avatar').attr('style'));
  a = {
     id: (b && "undefined" != typeof b[1] ? b[1] : false)
    ,name: trimStr( String($p.find('>.dropdown-toggle').text()).replace(/^Hi,\s/,'') )
    ,photo: (d && "undefined" != typeof d[1] ? d[1] : '')
    // ,isDonatur: ($('#quick-reply').get(0) ? true : false)
    ,isDonatur: ($('#quick-reply .capctha').length ? false : true)
  };
  clog(a);
  return a
}

function getSettings(stg){
  // state should define initial value | might fail on addons 
  getValue(KS + 'UPDATES', function(initval){
    if( !initval || (initval && initval.length === 0) ){
      for(var key in OPTIONS_BOX){
        if(typeof(key)!='string') continue;
        setValue(key, OPTIONS_BOX[key][0]);
      }
    }
  });

  /**
  eg. gvar.settings.updates_interval
  */
  var capsulate_done, settings = { lastused:{}, userLayout:{} };
  
  getValue(KS+'LAST_UPLOADER', function(ret){ settings.lastused.uploader=ret});
  
  settings.userLayout.config = [];
  getValue(KS+'LAYOUT_TPL', function(ret){settings.userLayout.template=ret});
  
  getValue(KS+'UPDATES_INTERVAL', function(ret){ settings.updates_interval=Math.abs(ret) });
  getValue(KS+'QR_DRAFT', function(ret){ settings.qrdraft=(ret!='0') });
  getValue(KS+'QR_HOTKEY_KEY', function(ret){ settings.hotkeykey=ret });
  getValue(KS+'QR_HOTKEY_CHAR', function(ret){ settings.hotkeychar=ret });
  getValue(KS+'TMP_TEXT', function(ret){ settings.tmp_text = ret });
  getValue(KS+'UPDATES', function(ret){ settings.updates=(ret=='1') });
  getValue(KS+'TXTCOUNTER', function(ret){ settings.txtcount=(ret=='1') });
  getValue(KS+'SCUSTOM_NOPARSE', function(ret){ settings.scustom_noparse=(ret=='1') });
  getValue(KS+'SHOW_SMILE', function(ret){ settings.autoload_smiley=ret });
  getValue(KS+'TABFIRST_SMILE', function(ret){ settings.tabfirst_smiley=ret });
  getValue(KS+'AUTOCOMPLETE_SML', function(ret){ settings.autocomplete_smiley=ret });

  getValue(KS+'ELASTIC_EDITOR', function(ret){ settings.elastic_editor=(ret=='1') });
  getValue(KS+'FIXED_TOOLBAR', function(ret){ settings.fixed_toolbar=(ret=='1') });
  getValue(KS+'THEME_FIXUP', function(ret){ settings.theme_fixups=ret });
  getValue(KS+'HIDE_GREYLINK', function(ret){ settings.hide_greylink=(ret=='1') });
  getValue(KS+'ALWAYS_NOTIFY', function(ret){ settings.always_notify=(ret=='1') });
  getValue(KS+'SHOW_KASKUS_PLUS', function(ret){ settings.show_kaskusplus=(ret=='1') });
  getValue(KS+'IMGBBCODE_KASKUS_PLUS', function(ret){ settings.kaskusplus_bbcode_img=(ret=='1') });

  // recount smilies;
  rSRC.getSmileyBulkInfo();

  settings.plusquote = null;
  
  gvar.$w.setTimeout(function(){
  getValue(KS+'UPDATES', function(ret){
    var hVal, hdc;
    
    // get layout config
    settings.userLayout.config = ('0,0').split(',');
    settings.userLayout.template = '[B]{message}[/B]';
    
    getValueForId(gvar.user.id, 'LAYOUT_CONFIG', [null,null], function(_hVal){

      if( !_hVal ) _hVal = ['', '0,0'];
      settings.userLayout.config = _hVal[1].split(',');
      
      getValueForId(gvar.user.id, 'LAYOUT_TPL', ['<!>','::'], function(_hVal){

        if( !_hVal ) _hVal = ['', '[B]{message}[/B]'];
        try{
          // warning this may trigger error
          settings.userLayout.template = decodeURIComponent(_hVal[1]).replace(/\\([\!\:])/g, "$1");
          
        }catch(e){
          clog('decodeURI in get setting failed');
          settings.userLayout.template = (_hVal[1]).replace(/\\([\!\:])/g, "$1");
        }
      });
    });
    
    // recheck updates interval
    hVal = settings.updates_interval;
    hVal = ( isNaN(hVal) || hVal <= 0 ? 1 : (hVal > 99 ? 99 : hVal) );
    settings.updates_interval=hVal;
    
    // hotkey settings, predefine [ctrl,shift,alt]; [01]
    hVal = settings.hotkeykey;
    settings.hotkeykey = ( hVal && hVal.match(/^([01]{1}),([01]{1}),([01]{1})/) ? hVal.split(',') : ['1','0','0'] );
    hVal = trimStr(settings.hotkeychar);
    settings.hotkeychar = ( !hVal.match(/^[A-Z0-9]{1}/) ? 'Q' : hVal.toUpperCase() );
    
    // autoload_smiley
    hVal = settings.autoload_smiley;
    settings.autoload_smiley = (hVal && hVal.match(/^([01]{1}),(kecil|besar|kplus|custom)+/) ? hVal.split(',') : '0,kecil'.split(',') );

    // tabfirst-smiley
    hVal = settings.tabfirst_smiley;
    settings.tabfirst_smiley = (hVal && hVal.match(/(kecil|besar|kplus|custom)/) ? hVal : 'kecil');

    // autocomplete-smiley
    hVal = settings.autocomplete_smiley;
    var autocomplete_smiley = (hVal && hVal.match(/^([01]{1}),(?:(kecil|besar|kplus),?)+/) ? hVal.split(',') : '0,kecil,besar,kplus'.split(',') ),
        tmp_autoc = String(autocomplete_smiley).split(',')
    ;
    autocomplete_smiley.shift();
    settings.autocomplete_smiley = [parseInt(tmp_autoc[0]), autocomplete_smiley];
    gvar.autocomplete_smilies = (settings.autocomplete_smiley[0] && settings.autocomplete_smiley[1] && settings.autocomplete_smiley[1].length );


    // is there any saved text
    gvar.tmp_text = settings.tmp_text;
    if( gvar.tmp_text!='' && !settings.qrdraft ){
      setValue(KS+'TMP_TEXT', ''); //set blank to nulled it
      gvar.tmp_text = null;
    }
    delete settings.tmp_text;
    
    capsulate_done = true;
    gvar.settings = settings;
    gvar.settings.done = 1;
    
    getUploaderSetting();
  });
  }, 5);
  
  var waitTillDone = function(stg){
    if( !capsulate_done ){
      gvar.$w.setTimeout(function(){ waitTillDone(stg) }, 1)
    }else{
      return settings;
    }
  };  
  return waitTillDone();
}

function getUploaderSetting(){
  // uploader properties
  gvar.upload_sel = {
    cubeupload:'cubeupload.com',
    imagevenue:'imagevenue.com',
    imagebam:'imagebam.com'
  };
  gvar.uploader = {
    cubeupload:{
      src:'cubeupload.com',noCross:'1' 
    },
    imagevenue:{
      src:'imagevenue.com/host.php',noCross:'1' 
    },
    imagebam:{
      src:'www.imagebam.com',noCross:'1' 
    }
  };
  // set last-used host
  try{
    if( gvar.settings.lastused.uploader )
      gvar.upload_tipe= gvar.settings.lastused.uploader;
    if( isUndefined( gvar.upload_sel[gvar.upload_tipe] ) )
      gvar.upload_tipe='kaskus';
  }catch(e){ gvar.upload_tipe='kaskus' }
}


function toggleTitle(){
  var $el = $('#qrtoggle-button').find('>.fa');
  $el.removeClass("fa-chevron-up fa-chevron-down");
  
  if( $('#formqr').is(':visible') ){
    $el.addClass("fa-chevron-up")
  }else{
    $el.addClass("fa-chevron-down")
  }
}

// adjust responsive/position of popup-dialog
function resize_popup_container(force_width){
  var bW, mxH,
      bH = parseInt( getHeight() ),
      cTop = 0,
      mdTop = 0,
      $kdb = $(".kqr-dialog-base"),
      is_capcapdialog = $('#wrap-recaptcha_dialog').is(":visible"),
      $mc = $('*[class^="main-content"]').first(),
      mW  = $mc.width(),
      $md = (is_capcapdialog ? $('.capcay-dialog') : $(".modal-dialog-main")),
      is_previewdialog = ($md.attr("id") == 'modal_dialog_box')
  ;
  
  if( force_width )
    bW = force_width;
  else if( $md.hasClass('static_width') )
    bW = $md.outerWidth();
  else{
    bW = mW;
    if( is_previewdialog )
      bW = (bW - 30);
  }
  

  if( $md.length ){
    // capcay-dialog
    if( is_capcapdialog ){
      clog("bH="+bH+'; mH='+$md.height());

      // is_capcapdialog = true;
      cTop = (bH / 2) - ($md.height() / 2) - 50;

      if( cTop < 0 ) 
        cTop = 0;

      bW = 320;
    }
    else if( is_previewdialog ){
      // top pos for edit/preview post
      mdTop = ($(".header.site-header").height() || 50);

      // on-resize
      if( $kdb.get(0).scrollHeight > $kdb.height() || ($("#box_preview").height()+$("#cont_button").height() > (bH-mdTop) ) )
        mdTop = gvar.offsetLayer;
    }
    else{

      mdTop = gvar.offsetLayer;
    }

    // (common) modal-dialog-main
    $md
      .css(!is_capcapdialog ? 'top':'margin-top', (is_capcapdialog ? cTop : mdTop) + 'px')
      .css('width', bW + 'px')
    ;
    mxH = ( bH - gvar.offsetMaxHeight - gvar.offsetLayer );

    // preview-dialog
    if( $('#box_preview').length )
      $('#box_preview')
        .css('max-height', mxH+'px');

    // setting-dialog
    if( $('#modal_setting_box').length ){
      $md = $('#modal_setting_box');
      $md.find(".st_contributor")
        .css("max-height", (mxH - 70) + 'px');
    }
  }
  else{
    var $ustick = $(".user-control-stick").first();
    gvar.maxH_editor = (bH - gvar.offsetEditorHeight - $ustick.height());
  }
}

function finalizeTPL(){
  var sec, cck, st='securitytoken', tt = gvar.thread_type;
  sec = gvar.fresh_st;
  if( !sec ){
    // this might be inaccessible thread, wotsoever
    clog('securitytoken not found, qr-halted');
    return;
  }
  
  gvar._securitytoken = String( sec );
  $('#formform').attr('action', gvar.domain + (tt=='forum' ? 'post_reply' : 'group/reply_discussion' ) + '/' + gvar.pID + (tt=='forum' ? '/?post=' : '') );

  $('#qr-'+st).val(gvar._securitytoken);
  $('#'+gvar.qID+' .message').css('overflow', 'visible');
  
  if( tt=='group' ){
    $('#qr-discussionid').val(gvar.discID);
    $('#qr-groupid').val(gvar.pID);
  }

  $('body').prepend(''
    // dark-backdrop
    +'<div id="qr-modalBoxFaderLayer" class="modal-dialog-backdrop"></div>'

    // even donatur stil need this for submision dialog only
    +'<div id="wrap-recaptcha_dialog" class="kqr-dialog-base ghost">'+rSRC.getBOX_RCDialog()+'</div>'
  );

  $('#resetrecap_btn').click(function(){

    gvar.is_solvedrobot = null
  });
}


function slideAttach(that, cb, params){
  var landed, $QR, $row, $tgt, topPos, destination, scOffset, prehide, isclosed, delay;
  $QR = $('#'+gvar.qID);
  $row = $(that).closest('.row');
  $tgt = $row.next();

  prehide = ($QR.closest('.ajax_qr_area').attr('id').replace("ajax_qr_area_","") != $row.attr('id').replace("post","") );
  isclosed = !$QR.find('#formqr').is(':visible');
  delay = 350;
  clog("isclosed="+isclosed);
  
  if( prehide )
    $QR.hide();
  else
    delay = 100;

  // destination = $(that).offset().top
  // scOffset = Math.floor(gvar.$w.innerHeight / 5) * 2;
  topPos = null;
  landed = 0;
  if( params ){
    if( "undefined" != typeof params.topPos )
      topPos = params.topPos;
  }

  if( topPos === null )
    topPos = ($(that).offset().top - (Math.floor(gvar.$w.innerHeight / 5) * 2));

  // $("html:not(:animated), body:not(:animated)").animate({ scrollTop: (destination-scOffset)}, delay, function() {
  $("html:not(:animated), body:not(:animated)").animate({ scrollTop: topPos}, delay, function() {
    if( !prehide && !isclosed ) {
      if(landed) return;
      $('#'+gvar.tID).focus();
      if( typeof cb == 'function') cb(that);
      landed = 1;
      return;
    }

    QR_put_after( $row );

    var $QR = $('#'+gvar.qID);
    if(isclosed) toggleTitle();
    $QR.find('#formqr').show();
    $QR.slideDown(220, function(){
      if(landed) return;
      $QR.find('#'+gvar.tID).focus();
      if( typeof cb == 'function') cb(that);
      landed = 1;
    });
  });
}

function scrollToQR(){

  do_click( $('#' + gvar.qID).closest(".ajax_qr_area").prev().find(".button_qr").get(0) );
}

function QR_put_after($el){
  if( !($el && $el.length) ) {
    clog("_1stlanded not defined");
    return;
  }

  var $ajaxqr = $el.next(),
    clasname = 'ajax_qr_area',
    $QR = $('#'+gvar.qID);

  if( $ajaxqr.hasClass(clasname) ){
    if( !$QR.length )
      $ajaxqr.html( rSRC.getTPL() );
    else{
      if( !$('#'+gvar.qID, $ajaxqr).length )
        $ajaxqr.html('').append( $('#'+gvar.qID) );
    }
  }
  else{
    var ajax_area_id = 'ajax_qr_area_'+$el.attr("id").replace("post","");
    
    $('<div class="'+clasname+'" id="'+ajax_area_id+'"></div>')
      .insertAfter( $el );

    $ajaxqr = $("#"+ajax_area_id);
    if( $QR.length )
      $ajaxqr.append( $('#'+gvar.qID) );
    else
      $ajaxqr.html( rSRC.getTPL() );
  }
  $("."+clasname).hide();
  $ajaxqr.show();
}

function start_Main(){

  var _url = location.href;

  gvar.thread_type = (_url.match(/\.kaskus\.[^\/]+\/group\/discussion\//) ? 'group' : (_url.match(/\.kaskus\.[^\/]+\/show_post\//) ? 'singlepost' : 'forum') );
  gvar.classbody = String($('body').attr('class')).trim(); // [fjb,forum,group]

  gvar.user = get_userdetail();
  gvar.fresh_st = $('*[id="securitytoken"]').val();
  if( !gvar.fresh_st ){
    // groupee has different selector
    gvar.fresh_st = $('*[name="securitytoken"]').val();
  }
  clog('type:'+gvar.thread_type+'; classbody:'+gvar.classbody+'; fresh_st:'+gvar.fresh_st);

  // do readonly if [not login, locked thread]
  if( !gvar.user.id || $('.fa.fa-lock').length || !gvar.fresh_st || $("#preview-post").length ){

    clog('Readonly mode on, coz:['
      +(!gvar.user.id ? 'user-not-login,':'')
      +($('.fa.fa-lock').length ? 'thread-locked,':'')
      +(!gvar.fresh_st ? 'missing-securitytoken,':'')
      +($("#preview-post").length ? "can't run in advanced reply-page":'')
      +']');
    gvar.readonly = true;
  }



  var maxTry = 50, iTry=0,
  wait_settings_done = function(){
    clog("queue wait_settings_done");
    if( !gvar.settings.done && (iTry < maxTry) ){
      // not yet? keep it up trying..
      gvar.$w.setTimeout(function(){ wait_settings_done() }, 100);
      iTry++;
    }else{
      clog("all settings loaded.");
      // setting done? lets roll..
      clog(gvar.settings);

      var $_1stlanded, mq_class = 'multi-quote';

      clog("Injecting getCSS");
      GM_addGlobalStyle(rSRC.getCSS(), 'kqr-dynamic-css');

      // pre, before removing it..
      $('#quick-reply').addClass('hide');


      set_theme_fixups();

      if( gvar.settings.hide_greylink )
        $('body').addClass('kqr-nogreylink');

      
      // need a delay to get all this settings
      gvar.$w.setTimeout(function(){

        // may reffer to groupid
        gvar.pID = (function get_thread_id(){
          // *.kaskus.*/show_post/{pID}/9121/-
          // *.kaskus.*/group/reply_discussion/{pID}
          // *.kaskus.*/post_reply/{pID}
          var cck, href, tt = gvar.thread_type;
          if( gvar.thread_type == 'forum' ){
            href = $('#act-post').attr('href');
            cck = /\/post_reply\/([^\/]+)\b/.exec( href );

            $_1stlanded = $('#thread_post_list > [class*="row"][id]').last();
          }
          else if( gvar.thread_type == 'singlepost' ){
            
            cck = /\/show_post\/([^\/]+)\b/.exec( location.href );

            $_1stlanded = $('.container > section > .row').last();
          }
          // [group]
          else{
            href = $('a[href*=reply_discussion]').attr('href');
            cck = /\/group\/reply_discussion\/([^\/]+)\b/i.exec( href );
            gvar.discID = (cck ? cck[1] : null);

            $_1stlanded = $('.listing-wrapper > .row').last();
            if( !$_1stlanded.find(".user-tools").length )
              $_1stlanded = $_1stlanded.prev();

            // initialise the row-id
            $_1stlanded.attr("id", 'grpost_'+$('.listing-wrapper > .row').length);
          }
          return (cck ? cck[1] : false);
        })();


        // prevent appending if we found dom-wrapper
        if( gID(gvar.qID) ){
          return setTimeout(function(){
            alert('QR-'+gvar.sversion+' load aborted.'+"\n"
              +'You may have another version of QR installed.'
            );
            $('#QR-main-css').remove();
          }, 1);
        }


        // remove quickreply original dom
        clog("removing original form quick-reply");
        $('#quick-reply').remove();


        var isInGroup = (gvar.thread_type == 'group');

        clog("Injecting getTPL");
        QR_put_after( $_1stlanded );
        

        $('.user-tools').each(function(idx){
          var $btn, $me = $(this);
          if( isInGroup )
            $me.closest('.row').attr('id', 'grpost_' + idx);
            
          var qqid, entry_id = $me.closest('.row').attr('id');
          
          // leave quote button alone, for donatur we kill their default button element
          $me.find('.button_qr').remove();
          $me.find("a.bar5").addClass("goog-btn goog-btn-default");

          $me
            .append('<a href="#" id="button_qr_'+ entry_id +'" class="goog-btn goog-btn-default goog-btn-set button_qr button_qrmod'+(gvar.readonly ? ' hide':'')+'" rel="nofollow" onclick="return !1"> Quick Reply</a>')
            .append('<a href="#" id="button_qq_'+ entry_id +'" class="goog-btn goog-btn-default goog-btn-set button_qq'+(gvar.readonly ? ' hide':'')+'" title="Quick Quote" onclick="return !1"><i class="fa fa-mail-forward"></i> </a>')
          ;
          // event for quick reply
          $me.find('.button_qr').click(function(ev){
            do_an_e(ev);
            var dothat = function(){
              slideAttach(that)
            }, that = $(this);
            if( gvar.edit_mode == 1 ){
              if( _AJAX.edit_cancel(false) )
                dothat();
              else
                _TEXT.focus();
            }else dothat();
          });
          
          // event for quote-quote
          $me.find('.button_qq').click(function(ev){
            do_an_e(ev);
            var dothat = function(that){
              slideAttach(that, function(el){
                gvar.settings.plusquote = (ev ? ev : window.event).shiftKey ? true : null;

                _QQparse.init(el, function(){
                  _TEXT.lastfocus();
                  gvar.settings.plusquote = null;
                });
              });
            }, that = $(this);
            
            if( gvar.edit_mode == 1 ){
              if( _AJAX.edit_cancel(false) )
                dothat( $(this) );
              else
                _TEXT.lastfocus();
            }else dothat( $(this) );
          });

          // event for quick edit
          $me.find('a[href*="/edit_"]').click(function(ev){
            do_an_e(ev);
            var $me = $(this);
            _AJAX.edit($me, function(){
              var func = function(){
                $('#dismiss_request').click(function(){
                  _NOFY.dismiss()
                });
              };
              _NOFY.init({mode:'quote', msg:'Fetching... <a id="dismiss_request" href="javascript:;">Dismiss</a>', cb:func, btnset:false});
            }, function(){
              _NOFY.init({mode:'edit', msg:'You are in <b>Edit-Mode</b>', btnset:true});
              

              var $row = $me.closest('.row');
              _NOFY.row_id = ($row.length ? $row.attr('id') : '');
              $row.find('.postlist').first().addClass('editpost');

              slideAttach($me, function(){
                _TEXT.lastfocus()
              });
            });
          });
          
          if( !isInGroup ){
            // add-event to multi-quote
            $btn = $me.find('a[id^="mq_"]');
            $btn.click(function(ev){
              var $dis = $(this);
              if( gvar.sTry_canceling ){
                delete(gvar.sTry_canceling);
                return;
              }

              if( gvar.edit_mode == 1 ){
                if( _AJAX.edit_cancel(false) ){
                  window.setTimeout(function(){
                    do_click($('#qr_chkcookie').get(0));
                  }, 100);
                }else{
                  gvar.sTry_canceling = 1;
                  do_click($me.get(0));
                }
              }else{
                window.setTimeout(function(){
                  do_click($('#qr_chkcookie').get(0));
                  if( !$dis.hasClass("btn-orange") )
                    $dis.removeClass("active");
                }, 100);
              }
            }).attr('data-btn', mq_class);

            if( $btn.hasClass("active") )
              $btn.addClass("btn-orange");
          }
        });
        // end each of user-tools

        
        // kill href inside markItUpHeader
        $('.markItUpHeader a').each(function(){
          $(this).attr('href', 'javascript:;')
        });

        if( !gvar.readonly )
          finalizeTPL();
        
        eventsTPL();
        // almost-done

        if( trimStr(gvar.tmp_text) && gvar.settings.qrdraft ){
          _DRAFT.switchClass('gbtn');
          _DRAFT.title('continue');
          $('#draft_desc').html( '<a href="javascript:;" id="clear-draft" title="Clear Draft">clear</a> | available' );
          $('#draft_desc #clear-draft').click(function(){
            _DRAFT.clear()
          });
        }
        
        // infiltrate default script
        clog("Injecting getSCRIPT");
        GM_addGlobalScript( rSRC.getSCRIPT() );
        (gvar.settings.autoload_smiley[0] == 1) && window.setTimeout(function(){
          do_click($('.ev_smiley:first').get(0));
        }, 50);


        // trigger preload recapcay
        if( !gvar.readonly && !gvar.user.isDonatur )
        if( gvar.thread_type != 'group' )
          window.setTimeout(function(){
            do_click($('#hidrecap_btn').get(0));
          }, 100);


        if( !gvar.noCrossDomain && gvar.settings.updates ){
          window.setTimeout(function(){
            _UPD.check();
            // dead-end marker, should set this up at the end of process
            gvar.freshload=null;
          }, 2000);
        }


        if( gvar.autocomplete_smilies ){

          var olmode = !( !gvar.force_live_css && gvar.__DEBUG__ ),
              base_path = 'http://'+(
                olmode?'ichord.github.io/At.js/dist/':'localhost/GITs/github/idoenk/kaskus-quick-reply/assets/vendor/'
              )
          ;
          GM_addGlobalStyle(base_path+(olmode ? 'css/':'')+'jquery.atwho.css', 'css-AtWho');
          
          if( olmode )
            GM_addGlobalScript('http://ichord.github.io/Caret.js/src/jquery.caret.js', 'js-caret');
          else
            GM_addGlobalScript(base_path+'jquery.caret.js', 'js-caret');
          GM_addGlobalScript(base_path+(olmode ? 'js/':'')+'jquery.atwho.js', 'js-AtWho');

          var initAtWho = function(){
            var smilies = [],
                mapSmlSuffix = {
                  kecil: 'kc',
                  besar: 'BS',
                  kplus: 'Ps'
                },
                mapSmlTitle = {
                  kecil: 'Emote Kecil',
                  besar: 'Emote Besar',
                  kplus: 'Kaskus Plus'
                }
            ;

            // collecting ksk_smiley
            for(var i=0, iL=gvar.settings.autocomplete_smiley[1].length; i<iL; i++){
              var smkey, smtmp, bb;
              smkey = gvar.settings.autocomplete_smiley[1][i];
              if( smkey == 'kplus' && !gvar.settings.show_kaskusplus )
                continue;

              if( 'undefined' != typeof gvar['sm'+smkey] && gvar['sm'+smkey].smilies ){
                smtmp = gvar['sm'+gvar.settings.autocomplete_smiley[1][i]].smilies;

                // v5.3.7.5
                // eg. ["<full-path>/smilies_fb5ogiimgq21.gif", ":wow", "Wow"]
                if( smtmp.length )
                for(var j=0, jL=smtmp.length; j<jL; j++){
                  bb = String(smtmp[j][1]).replace(/\:/g, '');
                  if( String(smtmp[j][2]).toLowerCase().indexOf(bb) === -1 )
                    smtmp[j][3] = bb+' | '+smtmp[j][2];
                  else
                    smtmp[j][3] = smtmp[j][2];


                  smtmp[j][3] += (mapSmlSuffix[smkey] ? ' <small title=\\\"'+(mapSmlTitle[smkey] ? mapSmlTitle[smkey] : '')+'\\\">['+mapSmlSuffix[smkey]+']</small>' : '');
                }
                smilies = smilies.concat( smtmp );
              }
            }


            if( smilies && smilies.length )
              GM_addGlobalScript( rSRC.getSCRIPT_AtWho(smilies), 'script-at-who' );
            else
              clog("[At.js]: Unable load smilies");

            smilies = null;
          };


          // preload smilies if not loaded yet
          if( !gvar.smbesar || !gvar.smkecil || (gvar.settings.show_kaskusplus && !gvar.smkplus) ){

            rSRC.getSmileySet(!1, function(){
              initAtWho()
            });
          }
          else{
            initAtWho()
          }
        }


        // make sure this run after css_validate done check everything is ok
        setTimeout(function(){
          // init minimized QR Editor
          if( $('#formqr').is(':visible') )
            $("#qrtoggle-button").trigger('click');
        }, 1235);

      }, 50);
      // settimeout pra-loaded settings 
    }
  };


  // main identifier identify, or forget it.. 
  if( !$(".user-tools").length || ( $("#thread_post_list").length && !gvar.user.id ) ){
    clog("QR not support on this page"+(!gvar.user.id ? "/not-login":"")+", halted...");
    return !1;
  }
  else{

    if( !gvar.readonly && !$("#preview-post").length )
      smilies_precheck(getSettings, wait_settings_done);
    else
      wait_settings_done();
  }
}

// outside kaskus host
function outSideForumTreat(){
  var whereAmId=function(){
    var _src, ret=false;
    getUploaderSetting();
    for(var host in gvar.uploader){
      _src = gvar.uploader[host]['src'] || null;
      if( _src && self.location.href.indexOf( _src )!=-1 ){
        ret= String(host); break;
      }
    }
    return ret;
  };

  var el,els,par,lb,m=20,loc = whereAmId(),CSS="",i="!important";
  /*
  # do pre-check hostname on location
  */
  if( window == window.top ) return;
 
  
  switch(loc){
    case "imagevenue":
    CSS=''
    +'table td > table:first-child{display:none'+i+'}'
    ;break;
    case "cubeupload":
    CSS=''
    +'.bsap{display:none'+i+'}'
    ;break;
  };
  // end switch loc
  if( CSS!="" ) 
    GM_addGlobalStyle(CSS,'inject_host_css', true);

  return false;
}



function init(){
  gvar.inner = {
    reply : {
      title : "Quick Reply",
      stoken  : "",
      submit  : "Post Reply"
    },
    edit  : {
      title : "Quick Edit",
      submit  : "Save Changes"
    }
  };
  gvar.titlename = gvar.inner.reply.title;
  
  var kdomain = domainParse();

  gvar.domain = kdomain.prot + '//' + kdomain.host +'/';
  gvar.kaskus_domain = 'www.kaskus.co.id';
  gvar.kask_domain = kdomain.prot+'//kask.us/';
  gvar.kkcdn = kdomain.prot + '//'+ kdomain.assets + '/';
  gvar.getsmilies_url = 'http://'+gvar.kaskus_domain+'/misc/getsmilies/';

  // set true to simulate using css from googlecode, [debug-purpose]
  gvar.force_live_css = null;

  // if __DEBUG__ is early set live_css wont happen
  if( gvar.__DEBUG__ ){
    gvar.force_live_css = !1;
  }
  else{
    if( gvar.__CLIENTDEBUG__ ){
      gvar.__DEBUG__ = 1;
      gvar.force_live_css = true;
    }
  }


  // Are you developing/forking this script?
  // make sure your local asset is accessible with correct path.
  gvar.kqr_static = 'http://' + (!gvar.force_live_css && gvar.__DEBUG__ ? 
    'localhost/GITs/github/idoenk/kaskus-quick-reply/assets/css/' : 
    'raw.githubusercontent.com/idoenk/kaskus-quick-reply/master/assets/css/'
  );

  if( !/(?:www\.|)kaskus\./.test(location.hostname) ){
    return outSideForumTreat();
  }
  
  gvar.qID= 'qr-content-wrapper';
  gvar.tID= 'kqr-reply-messsage';
  gvar.def_title= 'Type new Title';
  
  gvar.B  = rSRC.getSetOf('button');
  
  gvar.freshload = 1;
  gvar.uploader = gvar.upload_sel = gvar.settings = {};
  gvar.user = {id:null, name:"", isDonatur:false};
  gvar._securitytoken_prev = gvar._securitytoken= null;
  gvar.ajax_pid = {}; // each ajax performed {preview: timestamp, post: timestamp, edit: timestamp }
  gvar.edit_mode = gvar.pID = gvar.maxH_editor = 0;
  gvar.upload_tipe = gvar.last_postwrap = "";
  
  gvar.is_solvedrobot = null;
  
  gvar.offsetEditorHeight = 160; // buat margin top Layer
  gvar.offsetLayer = 10; // buat margin top Layer
  gvar.offsetMaxHeight = 115; // buat maxHeight adjustment

  
  ApiBrowserCheck();


  // intervene halt on old-captcha detected
  if( $("#recaptcha_wrapper").length ){

    clog("Old reCaptcha detected, QR is not supported.");
    return !1;
  }

  gvar.css_default = 'kqr.css';

  // treshold fetching css
  gvar.mx = 30; gvar.ix = 0;
  CSS_precheck();
  return !1;
}

// precheck smilies-bulk in localstorage
// me being called before triggering getSettings
function smilies_precheck(){
  clog('inside smilies_precheck..');
  var cb_alldone = (function(args){
    return function(){
      clog("inside cb_alldone..; load settings..");
      if( args.length )
      for(var i=0, iL=args.length; i<iL; i++){
        if( 'function' == typeof args[i] ){
          if( args[i].name == 'getSettings' )
            args[i]( gvar.settings )
          else
            args[i]();
        }
      }
    };
  }( arguments ));

  getValue(KS + 'SMILIES_BULK', function(ret){
    if( ret ){
      var smldata = null,
          lasUpdate = 0,
          counts = 0,
          smlbulk_interval = parseInt(1000 * 60 * 60 * 24 * 3) // 3-days?
      ;

      try{
        smldata = JSON.parse(ret);
        lasUpdate = parseFloat(smldata.lastupdate);
      }catch(e){}

      if( smldata ){
        if( smldata.ksk_smiley ){
          for(var smltype in smldata.ksk_smiley)
            if( smldata.ksk_smiley[smltype]['smilies'] )
              counts += smldata.ksk_smiley[smltype]['smilies'].length;
        }

        // either expired or count is zero
        if( ((parseFloat(smlbulk_interval)+lasUpdate ) < (new Date().getTime())) || counts <= 0 ){
          // running update
          clog('smilies_bulk expired or is blank, running update');
          _UPD_SMILIES.run( cb_alldone );
        }
        else{
          // good-togo
          clog('smilies_bulk Found, lastupdate: '+new Date(lasUpdate));
          cb_alldone();
        }
      }
      else{
        // blank-data from storage, run update anyway
        clog('smilies_bulk got blank from localstorage, running update..');
        _UPD_SMILIES.run( cb_alldone );
      }
    }
    else{
      clog("smilies_bulk not found, running update...");
      _UPD_SMILIES.run( cb_alldone );
    }
  });
}

function CSS_precheck(){
  if( !gvar.isOpera ){
    getValue(KS + 'CSS_META', function(ret){
      if( ret ){
        // check expired dari lastupdate (atleast 1 week)
        // --the longer should be no problemo, 3month?
        var cssbulk_interval = parseInt(1000 * 60 * 60 * 24 * 30*3);
        var parts = ret.split(';');

        if( gvar.scriptMeta.cssREV != parts[0] || ( (parseInt(cssbulk_interval)+parseInt(parts[1])) < (new Date().getTime()) )  ){
          /*
          * css needed to update due to several condition
          *  -qr engine changed, so the required css file
          *  -css_meta said that css_bulk is expired (> 7 days)
          */
          clog('CSS_META Expired');
          CSS_wait();
          
        }else{
          getValue(KS + 'CSS_BULK', function(ret){
            if( !ret ){
              // not found CSS_BULK
              clog('CSS_META:: CSS_BULK NOT Found');

              CSS_wait();
              return;
            }
            else{
              // set css to DOM; update timestamp for next lastupdate check
              clog('CSS_META:: CSS_BULK Found, we good togo');
              _CSS.set_css(ret, start_Main);
            }
          });
        }
        
        
      }else{
        // no meta yet, key deleted?
        clog('CSS_META not found, first-run/reset?');
        CSS_wait();
      }
    });
  }else{
    clog('[Opera|Debug] fetch fresh css from: ' + gvar.kqr_static + gvar.css_default);
    
    GM_addGlobalStyle(gvar.kqr_static + gvar.css_default, 'direct_css', true);
    window.setTimeout(function(){ start_Main() }, 350);
  }
}

function CSS_wait(refetch_only, cb){
  clog('CSS_wait inside');

  if( !gvar.force_live_css )
  if( gvar.noCrossDomain || gvar.__DEBUG__ ) {
    var css_uri = gvar.kqr_static + gvar.css_default + '?_=' + String(gvar.scriptMeta.timestamp) + '-' + String(gvar.scriptMeta.cssREV);
    
    clog('[debug-mode] OR crosdomain not possible, performing direct load css');
    clog('*GM_addGlobalStyle_: '+css_uri);
    GM_addGlobalStyle(css_uri, 'direct_css', true);

    start_Main();
    if( typeof cb == 'function' )
      cb();
    return;
  }

  if( !$('#xhr_css').length && gvar.ix < gvar.mx ){
    if( !_CSS.engage ){
      _CSS.init();
      _CSS.run(gvar.css_default, _CSS.callback);
      _CSS.engage = 1;
    }
    gvar.$w.setTimeout(function () { CSS_wait(refetch_only, cb) }, 200);
    gvar.ix++;
  }else{
    gvar.ix = 0;
    _CSS.engage = null;
    if( !refetch_only )
      start_Main();
    if( typeof cb == 'function' ) cb();
  }
}


// -=-= ready..
var _$ = jQuery ? jQuery.noConflict():null;
if( _$ ){
  var $ = _$;
  _$ = null;
}

if( "undefined" === typeof $ ){
  console.warn("Unable to load jQuery, QR script halted");
  return !1;
}
else{
  gvar.__DEBUG__ &&
    clog("jQuery acknowledged as $ with noConflict");
}

gvar.__DEBUG__ &&
  clog("initialized mothership with="+mothership);
  
return init();
}
// main


function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", location.protocol + "\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/1.11.1\/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}


var gsv; try { gsv=GM_setValue.toString(); } catch(e) { gsv='.errGSV'; }
if( 'undefined' == typeof chrome && 'undefined' == typeof ENV && 'undefined' == typeof GM_setValue || gsv.match(/not\s+supported/i) )
  addJQuery( main );
else
  main('tamper|GM');

// ============
})();
