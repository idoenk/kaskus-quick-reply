# Kaskus Quick Reply
Kaskus Quick Reply is a userscript designed for donatur or regular user in Kaskus forum. Enhance your experience/ engengement to reply post with lot of features.
 <a class="btn btn-primary" href="kaskus_quick_reply.user.js?raw=true" title="Install Dev.Version KQR"><img src="https://dl.dropboxusercontent.com/u/33009152/btn-install-min.png"/ alt="Install Script"></a>

# About this <code>fjb-regular</code> branch 
We decide the latest QR development wont supporting dual captcha mode capabilty with old reCAPTCHA;
This script is a failover code to make QR work in [kaskus-fjb](http://fjb.kaskus.co.id/) since the captcha still use the old one. Code was forked from <strong>v5.3.1.6</strong> and It will only run on fjb subdomain.This script is using different namespace so you can install it along with the latest version to make QR also available on forum with new "NO CAPTCHA reCAPTCHA" (for regular user).

If you are a donatur user, you should use [latest QR version](https://github.com/idoenk/kaskus-quick-reply).

# Contribute
You can contribute by any different way. There are several channel to involved in discussion, starting from [:: All About Mozilla Firefox (Add-ons, Scripts, Fans Club) ::](http://kask.us/hCZmM), report issues of stable-stage in [Greasyfork](https://greasyfork.org/en/forum/discussion/196/x), or you can also help find bugs (and directly report them in [issue tracker](https://github.com/idoenk/kaskus-quick-reply/issues))

# Not Gonna Happen
This Kaskus Quick Reply script **WILL NOT** bypass recaptcha-step (as long as it required) for regular user.

# Optional requirements (development)
[Compass](http://compass-style.org/)

Watch and Compile the assets project;
When doing development, you can run compass watcher to keep CSS files up to date as changes are made.

``` 
$ cd /path/to/kaskus-quick-reply
$ compass watch assets
``` 

# License
Licensed under a [Creative Commons Attribution-NonCommercial-ShareAlike 3.0 License](http://creativecommons.org/licenses/by-nc-sa/3.0)
