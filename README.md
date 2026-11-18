# Resonance

A free hi-res music player for Windows 10 (19041+) and 11 (x64), and Android 12+.

**Website:** https://senthamizhanr.github.io/resonance/
**Download:** Windows installer on [Releases](https://github.com/senthamizhanR/resonance/releases) · Android APK at [`apk/`](apk/)

This repository holds the download website (plain HTML, CSS and JS served by GitHub Pages from the repository root), the Windows installer releases, and the signed Android APK.

## Site

- `index.html`, `styles.css`, `app.js`: no build step. Download URLs, versions, sizes and SHA-256 hashes for both platforms are in `CONFIG` at the top of `app.js`.
- `apk/`: the signed Android APK (small enough for the repo; the 98 MiB Windows installer is a Release asset instead).
- `assets/fonts`: Fraunces, Hanken Grotesk and JetBrains Mono, self-hosted under the SIL Open Font License (licence files alongside).
- `assets/shots`: screenshots of Resonance playing a demo library of music synthesised for this site and dedicated to the public domain (CC0). The artists and albums are fictional.

To preview locally: `python -m http.server 8766` in this folder.

## Credits

FFmpeg 8.1 (LGPL 2.1, BtbN builds), FFmpeg.AutoGen, NAudio, Win2D, Windows App SDK / WinUI 3, .NET 8, CommunityToolkit.Mvvm, Inno Setup, Segoe Fluent Icons (Microsoft). Android: Jetpack Compose, Media3, AAudio, dr_libs (public domain), Apple ALAC (Apache 2.0). HRTF model after Brown & Duda (1998).

Made by [Senthamizhan R](https://github.com/senthamizhanR).
