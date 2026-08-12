# Programming Bootcamp – Team 8

## Requirements for Team Page and Login Styling

This is a mock sprint, and it is being executed to prove that our team can run an actual sprint with branches, requirements, design, developing, testing, and then end it up review and release. This will give us the opportunity to cover any shortcomings for the actual IBM sprint.

---

## 1. Team Page Fields and Logic

Team page is the first page that the user lands upon after the login page. It will introduce the team behind the working of the application. This makes the users more connected to the application and gives the rightful reward to the development team.

Every team member will have their own card, which would contain all the details in the following table:

| Field | Doc Type | Requirement | Limit | Display Rules |
|---|---|---|---|---|
| Name | Text | Compulsory | Max 30 characters | Heading of each card |
| Role | Text | Compulsory | Max 25 characters | To be followed by name as a subheading |
| Image | JPG, PNG | Optional | <10 MB, 4:5 aspect ratio | At one corner; default avatar if picture not provided |
| Blurb | Text | Optional | <200 characters | After 4 lines worth of space is consumed, a "read more" hyperlink is to be attached |

The cards will be displayed 4 at a time on a bigger laptop/desktop screen and one at a time on a smaller smartphone screen.

---

## 2. Login Page Styling and Scope

The login page will only be altered for styling. In this sprint we will **not** change the authentication logic, validation rules, and session handling behaviour.

Styling the login page in this sprint will give it a fresh start. This will be possible by sharing the following direction for UX:

- **Layout** — Clear visual hierarchy along with equal and breathable gap between buttons and fields.
- **Branding and Consistency** — Need to put up the brand logo and a similar theme on every page.
- **Adaptiveness** — The site should adapt according to the screen size and change its dimensions accordingly.
- **Eye Pleasing** — The colour scheme should not be tacky or too bright for the eye. The icons and boxes are also not to be placed randomly.
- **Easy to Navigate** — The website needs to be easy to navigate by keeping the menu simple and placing key hyperlinks on the Login and Home page.
- **Alignment** — The login dialogue box needs to be centrally aligned.

> **Note** — Only visual elements are to be changed in this sprint.

---

## 3. Edge Cases

| Given | When | Then |
|---|---|---|
| Team member skipped or has not uploaded a photo | Their card is displayed | The system should display the default avatar in the same 4:5 aspect ratio |
| Team member's blurb exceeds 4 lines | Their card is displayed | It gets continued to a "read more" hyperlink |
| Team member skipped to put a blurb | The cards are displayed on a bigger screen (desktop) | The card expands other fields and covers the whole space |
| The team has a member count which is not a factor of 4 | The cards are displayed on a bigger screen (desktop) | The empty rows leave the spaces instead of stretching out the cards |
| Team member name exceeds 20 characters | Their card is displayed | The first name gets converted to their initials. For example — John Smith becomes J. Smith |

---

## 4. General Questions

**Q:** Does the user automatically land on the Team page after login, or is it optional?
**A:** According to the briefing, it is the requirement that users land on the Team page after logging in.

**Q:** What if you try to access the Team page before logging in via a URL?
**A:** Not part of this sprint, but should be redirected to the login page.

---

## Summary for UX

This document outlines the layout of the Team page and Login page requirements for Sprint 1, and the suitable response to some edge cases. It is meant as a starting point and does not work as a locked spec — the exact visual styling is open for UX to design. Feel free to refine any of these parameters as we move closer to the design process.

---

## Versions

| Version | Notes |
|---|---|
| 1.0 | Initial draft with basic fields, login style directions, and edge cases |
| 1.1 | Confirmed that team page is not optional and is an automatic landing page |
| 1.2 | Added questions, purpose of sprint, and changed the layout of edge cases |
