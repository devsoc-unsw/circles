# Circles CTF Challenge Write-up (2025 CSESoc/DevSoc/SecSoc CTF)

This is the writeup for solving the Circles CTF challenge.

The goal is to find two secret pieces of text. Combine them in order (Piece 1 then Piece 2) to form the final flag: `RCR{[Piece1][Piece2]}`.
For example, if the first piece is `ICouldEatLike` and the second piece is `100McNuggets`, then the final flag is: `RCR{ICouldEatLike100McNuggets}`.

## Part 1: The Writing's on the Wall

The `challenge.html` page describes Part 1 as "The Writing's on the Wall" and gives the following hint:
> "The first piece of the flag is hiding in plain sight, almost on every page of circles. If you're careful and detail-oriented, you'll find it."

This implies the flag piece is located in a common UI element that appears on most pages of the site, such as the main header or navigation bar.

To find it:
- Sharp eyes: Use a screen with accurate colours to see where it is.
- OR Inspect Element: Use Inspect element to find the suspicious element.
- OR Highlighting: Highlight parts of the page with your mouse. Likely the easiest way.

Definitely a beginner friendly and fun challenge.


## Part 2: BOTS0101 - Stop Bots from taking our jobs

The `challenge.html` page describes Part 2 as "BOTS0101 - Stop Bots from taking our jobs" and gives the hint:
> "Today's tech landscape is a freaky one, with a lot of automation going around. Websites often have a guide for web crawlers (like Googlebot) telling them which areas to avoid. But you're not a web crawler, you're a human (surely right), and you can totally avoid it for us."

Some dablling and research tells them to look at the `robots.txt` file.


In your browser, navigate to the `robots.txt` file for Circles (`circles.devsoc.app/robots.txt`).


The content of `robots.txt` will look something like this:
```
User-agent: *
Disallow: /s3cr3t_p4g3.html
```
The line `Disallow: /s3cr3t_p4g3.html` indicates a hidden page that web crawlers are instructed not to access.


Go to the disallowed path in your browser (e.g., `circles.devsoc.app/s3cr3t_p4g3.html`).

This page (`s3cr3t_p4g3.html`) will display the second piece of the flag

## Part 3: Combining the Flags

Combine the flags...

Congratulations! You have successfully completed the CTF challenge. 