# Spain–France Conference on Singularities and Applications

Static website for the conference at Université d’Angers, 19–23 April 2027.

The site is intentionally dependency-free: semantic HTML, custom CSS, and a small
vanilla JavaScript enhancement for the mobile navigation and active section state.

## Local preview

```sh
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## Deployment

GitHub Pages publishes the `main` branch from the repository root:

<https://singularitiesspfr.github.io/>

## Registration workflow

Registration and cancellation-request forms are delivered to the organisers by
Web3Forms. Web3Forms does not enforce one submission per email, so duplicate
registrations are reconciled manually in the conference inbox. The public
participant list is updated by the organisers and includes only people who
explicitly agreed to publish their name and affiliation.
