document.addEventListener('DOMContentLoaded', function () {
    console.log('DOMContentLoaded Event fired');
    
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationsList = document.getElementById('notificationsList');
    const todayDate = new Date().toISOString().split('T')[0]; // Format: "YYYY-MM-DD"
    console.log('notificationBadge:', notificationBadge);
    console.log('notificationsList:', notificationsList);

    // Funktion zum Aktualisieren des Badge-Zählers
    function updateBadgeCount() {
        console.log("updateBadgeCount called");

        // Nur auf notification.html: Benachrichtigungen zählen
        if (notificationsList) {
            console.log("Auf notification.html Seite");

            const remainingNotifications = document.querySelectorAll('.notification-card').length;
            console.log("remainingNotifications (notification.html):", remainingNotifications);
    
            // Badge aktualisieren, falls es Benachrichtigungen gibt
            if (remainingNotifications > 0) {
                notificationBadge.innerText = remainingNotifications;
                notificationBadge.style.display = 'inline-block';
                console.log("Badge angezeigt mit Anzahl:", remainingNotifications);
            } else {
                notificationBadge.style.display = 'none';
                console.log("Badge versteckt, keine Benachrichtigungen");
            }
        } else {
            console.log("Auf einer anderen Seite als notification.html");
    
            // Auf anderen Seiten (z. B. stammdaten.html) den Zähler aus localStorage verwenden
            const storedNotifications = Object.keys(localStorage).filter(key => key.endsWith(todayDate) && !localStorage.getItem(key)).length;
            console.log("storedNotifications (localStorage):", storedNotifications);
    
            // Badge-Zähler aus localStorage verwenden
            if (storedNotifications > 0) {
                notificationBadge.innerText = storedNotifications;
                notificationBadge.style.display = 'inline-block';
                console.log("Badge angezeigt mit Anzahl:", storedNotifications);
            } else {
                notificationBadge.style.display = 'none';
                console.log("Badge versteckt, keine gespeicherten Benachrichtigungen");
            }
        }
    }

    // API-Abfragen zur täglichen Überprüfung der Benachrichtigungen
    fetch('/api/check-speech-in-noise-test')
        .then(response => response.json())
        .then(data => {
            console.log('API check-speech-in-noise-test:', data);
            if (data.alert) {
                createNotification(
                    'Ihr letzter Speech-in-Noise Test liegt unter 50%. Bitte buchen Sie einen Termin für eine Überprüfung.',
                    '/booking.html',
                    'speech_in_noise_test'
                );
            }
        })
        .catch(error => console.error('Fehler beim Abrufen der Benachrichtigung:', error));

    fetch('/api/check-speech-in-noise-test2')
        .then(response => response.json())
        .then(data => {
            console.log('API check-speech-in-noise-test2:', data);
            if (data.alert) {
                createNotification(
                    'Ihre letzten 2 Speech-in-Noise Tests liegen unter 100%. Bitte buchen Sie einen Termin für eine Überprüfung.',
                    '/booking.html',
                    'speech_in_noise_test2'
                );
            }
        })
        .catch(error => console.error('Fehler beim Abrufen der Benachrichtigung:', error));

    fetch('/api/check-seven-days-no-test')
        .then(response => response.json())
        .then(data => {
            console.log('API check-seven-days-no-test:', data);
            if (data.alert) {
                createNotification(
                    'Es ist Zeit für einen neuen Speech-in-Noise Test. Der letzte Test war vor mehr als 7 Tagen.',
                    '/hearingtest/sin.html',
                    'seven_days_no_test'
                );
            }
        })
        .catch(error => console.error('Fehler beim Abrufen der Benachrichtigung:', error));

    // Überprüft, ob der letzte Reintonaudiometrie-Test unter 50% lag
     fetch('/api/check-reintonaudiometrie-test')
        .then(response => response.json())
        .then(data => {
            console.log('API check-reintonaudiometrie-test:', data);
            if (data.alert && !displayedNotifications.has('reintonaudiometrie_test_under_50')) {
                createNotification(
                    data.message,
                    '/booking.html',
                    'reintonaudiometrie_test_under_50'
                );
                displayedNotifications.add('reintonaudiometrie_test_under_50');
            }
        })
        .catch(error => console.error('Fehler beim Abrufen der Benachrichtigung:', error));


    // Überprüft, ob der letzte Reintonaudiometrie-Test mehr als 7 Tage zurückliegt
    fetch('/api/check-seven-days-no-reintonaudiometrie-test')
            .then(response => response.json())
            .then(data => {
                console.log('API check-seven-days-no-reintonaudiometrie-test:', data);
                if (data.alert) {
                    createNotification(
                        data.message,
                        '/hearingtest/reintonaudiometrie.html',
                        'seven_days_no_reintonaudiometrie_test'
                    );
                }
            })
            .catch(error => console.error('Fehler beim Abrufen der Benachrichtigung:', error));

        let displayedNotifications = new Set();

    
    // Badge-Zähler initial aktualisieren
    setTimeout(() => {
        console.log("Initial Badge update");
        updateBadgeCount();
    }, 100); // Zähler nach kurzer Verzögerung aktualisieren, um sicherzustellen, dass alle Benachrichtigungen geladen sind

    // Wenn 'notificationsList' nicht existiert, Badge-Zähler trotzdem aktualisieren
    if (!notificationsList && notificationBadge) {
        console.log('notificationsList nicht gefunden, nur Badge-Zähler aktualisieren');
        updateBadgeCount();
    }

    // Die createNotification-Funktion
    function createNotification(message, redirectUrl, notificationId) {
        const storageKey = `${notificationId}-${todayDate}`;

        // Verhindert das erneute Anzeigen der Benachrichtigung, wenn sie heute bereits geschlossen wurde
        if (localStorage.getItem(storageKey)) return;

        const alertDiv = document.createElement('div');
        alertDiv.classList.add('notification-card');
        alertDiv.setAttribute('data-notification-id', notificationId); // Einfache Zuordnung für spätere Manipulation

        alertDiv.innerHTML = `
            <h5>Neue Benachrichtigung</h5>
            <p>${message}</p>
            <button class="notification-button" onclick="window.location.href='${redirectUrl}'">Mehr erfahren</button>
            <span class="close-btn" id="close-btn-${notificationId}">&#10006;</span>
        `;

        notificationsList.prepend(alertDiv);

        const closeButton = document.getElementById(`close-btn-${notificationId}`);
        closeButton.addEventListener('click', function () {
            closeNotification(notificationId);
        });

        // Sicherstellen, dass der Zähler nach der Benachrichtigung aktualisiert wird
        setTimeout(() => {
            console.log('updateBadgeCount after notification');
            updateBadgeCount();
        }, 0); // Zähler aktualisieren, nachdem die Benachrichtigung hinzugefügt wurde

        showToast("Neue Benachrichtigung erhalten!");
    }

    // Funktion zum Schließen der Benachrichtigung
    function closeNotification(notificationId) {
        const storageKey = `${notificationId}-${todayDate}`;
        localStorage.setItem(storageKey, 'true'); // Speichert, dass die Benachrichtigung geschlossen wurde

        const notificationElement = document.querySelector(`[data-notification-id="${notificationId}"]`);
        if (notificationElement) {
            notificationElement.remove();
        }

        // Aktualisiert den Badge-Zähler nach dem Schließen der Benachrichtigung
        updateBadgeCount();
    }

    // Zeigt Toast-Benachrichtigung an
    function showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast-notification');
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 6000); // Toast verschwindet nach 6 Sekunden
    }
});