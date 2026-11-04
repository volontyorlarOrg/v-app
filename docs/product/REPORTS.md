# Reporting a problem

Signed-in volunteers open **Report a problem** below Settings in the desktop
sidebar or from the phone's account menu. The dialog stays over the affected
page. Its only visible input is the problem description (1-5,000 characters).

`ReportProblemProvider` sits in the app shell outside the page error boundary.
It freezes the pathname when opened and generates a submission UUID. Search
parameters and fragments are excluded. The path is shown in the dialog, with
a reminder to leave out sensitive data. Text never enters browser storage or
a URL.

The Server Action validates again, requires the existing encrypted server
session, calls `POST /reports`, and parses the receipt. Text and the UUID survive
failed sends. Success closes the dialog and shows a toast. Cancellation and
success restore focus to the desktop trigger or mobile account-menu trigger.
Closing and duplicate submissions are blocked while sending. The hourly limit
is explained without discarding the description.

Only administrators read reports. There are no uploads or volunteer history
pages. Contract: [`REPORTS.md`](../../../v-backend/docs/architecture/REPORTS.md).
