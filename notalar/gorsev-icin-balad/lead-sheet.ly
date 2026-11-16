\version "2.24.0"
\header {
  title = "Görsev İçin Balad"
  subtitle = "Kerem Görsev'e ithaf"
  composer = "Müzik: Claude"
  instrument = "kilise-orgu projesi için"
  tagline = "github.com/z8002/kilise-orgu"
}
\paper { #(set-paper-size "a4") ragged-last-bottom = ##t }

melA = {
  d''4 a'8 e'' f''2 | e''4 d'' cis''2 | c''4 g'8 d'' e''2 | d''4 c'' b'2 |
  bes'8 d'' f''4 e''2 | a'8 c'' e''4 d''2 | g'8 bes' d''4 cis''2 |
}
chA = \chordmode { d1:m | d:m7+ | d:m7 | d2:m7 d:m6 | g:m7 c:7 | f:maj7 bes:maj7 | e:m7.5- a:7 | }
melB = {
  ees''4 d''8 ees'' g''2 | f''4 ees''8 c'' a'2 | d''4 c''8 d'' f''2 | ees''4 d''8 bes' g'2 |
  bes'4 d'' g''2 | f''4 e'' cis''2 | d''2. a'4 | e''8 d'' cis'' bes' a'2 |
}
chB = \chordmode { c1:m7 | f:7 | bes:maj7 | bes/f | e:m7.5- | a:7.13- | d:m | a:7.9- | }

melody = {
  \clef treble \key d \minor \time 4/4
  \tempo "Ballad (swing 8ths)" 4 = 60
  \mark \markup \box \bold "A"
  \repeat volta 2 { \melA d''1 }
  \mark \markup \box \bold "B"
  \melB
  \bar "||" \mark \markup \box \bold "A"
  \melA d''1_\markup \italic "rit." | f''1 | fis''1\fermata \bar "|."
}
akorlar = \chordmode {
  \repeat volta 2 { \chA d1:m }
  \chB
  \chA d1:m | d:m6 | d |
}

\score {
  <<
    \new ChordNames \akorlar
    \new Staff \melody
  >>
  \layout { indent = 0 }
}
