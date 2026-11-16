\version "2.24.0"
\header { title = "Görsev İçin Balad" subtitle = "piyano düzenlemesi" composer = "Müzik: Claude" tagline = ##f }

% Sağ el: A1 sade, A2 ve B ikili seslerle, son A sade
rhA = { d''4 a'8 e'' f''2 | e''4 d'' cis''2 | c''4 g'8 d'' e''2 | d''4 c'' b'2 |
        bes'8 d'' f''4 e''2 | a'8 c'' e''4 d''2 | g'8 bes' d''4 cis''2 | }
rhAh = { d''4 a'8 e'' <d'' f''>2 | e''4 d'' <a' cis''>2 | c''4 g'8 d'' <c'' e''>2 | d''4 c'' <f' b'>2 |
         bes'8 d'' f''4 <bes' e''>2 | a'8 c'' e''4 <a' d''>2 | g'8 bes' d''4 <g' cis''>2 | }
rhB = { ees''4\mf d''8 ees'' <ees'' g''>2 | f''4 ees''8 c'' <ees' a'>2 | d''4 c''8 d'' <d'' f''>2 | ees''4 d''8 bes' <d' g'>2 |
        bes'4\f d'' <d'' g''>2 | f''4 e'' <g' cis''>2 | <a' d''>2.\mf a'4 | e''8 d'' cis'' bes' <e' a'>2 | }
right = {
  \clef treble \key d \minor \time 4/4
  \tempo "Ballad" 4 = 60
  <>\mp \rhA d''1 |
  <>\mf \rhAh <a' d''>1 |
  \rhB
  <>\p \rhA
  \tempo 4 = 50 d''1 |
  \tempo 4 = 44 <b' d'' f''>1\pp |
  \tempo 4 = 38 <a' d'' fis''>1\fermata \bar "|."
}

% Sol el: pedallı arpejler (her akor değişiminde pedal yenilenir)
lhA = { d,8\sustainOn a, d f a f d a, | d,8\sustainOff\sustainOn a, cis f a f cis a, |
        d,8\sustainOff\sustainOn a, c f a f c a, | d,8\sustainOff\sustainOn a, c f d,\sustainOff\sustainOn a, b, f |
        g,8\sustainOff\sustainOn d f bes c,\sustainOff\sustainOn g, bes, e |
        f,8\sustainOff\sustainOn c e a bes,,\sustainOff\sustainOn f, d a |
        e,8\sustainOff\sustainOn bes, d g a,,\sustainOff\sustainOn e, cis g | }
lhDm = { d,8\sustainOff\sustainOn a, d f a f d a, | }
lhB = { c,8\sustainOff\sustainOn g, ees bes d' bes ees g, | f,8\sustainOff\sustainOn c ees a c' a ees c |
        bes,,8\sustainOff\sustainOn f, d a d' a d f, | f,8\sustainOff\sustainOn bes, f bes f,\sustainOff\sustainOn bes, d g |
        e,8\sustainOff\sustainOn bes, d g bes g d bes, | a,,8\sustainOff\sustainOn e, cis g cis' g cis e, |
        d,8\sustainOff\sustainOn a, d f a f d a, | a,,8\sustainOff\sustainOn e, cis g bes g cis e, | }
left = {
  \clef bass \key d \minor \time 4/4
  <>\p \lhA \lhDm
  <>\mp \lhA \lhDm
  <>\mp \lhB
  <>\pp \lhA \lhDm
  d,8\sustainOff\sustainOn a, f b d'2 |
  d,8\sustainOff\sustainOn a, fis a d'2\fermata \bar "|."
}

\score {
  \new PianoStaff << \new Staff \right \new Staff \left >>
  \layout { indent = 0 }
}
\score {
  \new PianoStaff <<
    \new Staff { \set Staff.midiInstrument = "acoustic grand" \right R1 }
    \new Staff { \set Staff.midiInstrument = "acoustic grand" \left s2. s4\sustainOff }
  >>
  \midi { }
}
