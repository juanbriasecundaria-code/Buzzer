# Selección por ronda y participante

Cambios aplicados a Guess Movies & Songs, 100 Argentinos Dicen, Palabras a Tiempo y El Erudito. No se modificaron Impostor ni Quién lo dijo.

## Cómo probar

1. Publicá la carpeta completa, incluidos los nuevos archivos `.js`, junto a los HTML. Conservá todos los archivos en el mismo nivel. Si seguís viendo la versión anterior, recargá sin caché.
2. Abrí `velada.html`. En el fixture de Fase 1 o Fase 2, tocá **Activar ronda N**. Se toman los cruces reales del fixture configurado; los nombres del ejemplo no están fijos en el código.
3. También podés tocar **Activar este cruce** debajo de un enfrentamiento para cambiar únicamente ese juego, sin afectar las otras mesas.
4. En los celulares, entrá al HUB (`index.html`), elegí el juego y tu nombre. Verás **Ronda N · X vs. Y** y solo los participantes de ese cruce.
5. Para continuar, activá la siguiente ronda desde el fixture. Los teléfonos que estaban en el buzzer vuelven a la selección de nombres.

## Comportamiento por juego

- **100 Argentinos:** aparecen los dos participantes individuales. El nombre elegido se vincula al lado correspondiente del buzzer.
- **Guess Movies & Songs:** aparecen los integrantes de los dos equipos activos. Elegir un nombre asigna su equipo automáticamente. Cualquier integrante puede tocar; el bloqueo por respuesta incorrecta sigue siendo por equipo.
- **Palabras a Tiempo:** no se agrega buzzer. Tras elegir nombre se abre el juego; el marcador y la cabecera muestran los participantes y la ronda del fixture. Si cambia el cruce, un enlace de la ronda anterior pide volver a elegir. La página también puede abrirse directamente como pantalla de apoyo.
- **El Erudito:** no se agrega buzzer. Se conserva la respuesta numérica compartida por equipo. Los nombres elegidos se vinculan automáticamente al equipo del cruce. La ronda del fixture aparece en la cabecera y el contador interno pasa a decir **Pregunta**. La primera respuesta enviada por un equipo queda bloqueada hasta la siguiente pregunta.

## Al activar una ronda

La activación se confirma antes de publicar porque reinicia el marcador del juego para los nuevos participantes. No borra ni carga resultados en la tabla de la velada, ni modifica mazos. Activar una ronda completa cierra la selección de los juegos vinculados sin cruce en esa ronda. Activar un solo cruce mantiene las otras mesas.

No se avanza automáticamente al cargar un resultado: el conductor elige cuándo cambiar los participantes. Reabrir o refrescar la página del fixture tampoco activa cruces automáticamente.

Los nombres y equipos se toman del fixture en el momento de activación. Si los editás después, volvé a activar el cruce para publicar el cambio. Cada juego admite un cruce activo; si el fixture contiene dos cruces del mismo juego en una ronda, hay que activarlos por separado.

## Conexión y comprobaciones

Se usa la conexión Firebase ya existente. Los celulares necesitan leer los nodos del juego y el panel necesita publicar la ronda. Si las reglas actuales restringen las rutas nuevas, el administrador deberá habilitar los permisos apropiados para `velada/palabras` y la publicación del fixture en los nodos existentes; no se incluyeron ni cambiaron reglas de seguridad.

Pruebas anteriores declaradas: sintaxis JavaScript; armado de cruces individuales y por equipos; rechazo de participante ajeno, lado incorrecto y cruce vencido; un solo ganador; navegación móvil; desconexión; transición de ronda; respuestas de Erudito; publicación desde el fixture; conservación de metadatos y cancelación de cuentas regresivas anteriores en Guess y 100 Argentinos. Esas pruebas anteriores no equivalen a una prueba de punta a punta con Firebase real.

## Verificación de la captura automática (27/09/2026)

Se corrigió el adaptador Firebase del panel para que pueda leer los marcadores con `once('value')`: antes esa operación faltaba y el botón **Cargar resultados automáticamente** caía siempre en la carga manual. También se evita reutilizar resultados automáticos viejos si falla la lectura, se impide asignar el siguiente cruce si falla la lectura de resultados y se vuelve a intentar publicar el fixture cuando una escritura es rechazada.

Pruebas ejecutadas con base simulada: asignación del primer cruce, marcador en vivo, captura al abrir el modal, bonus de Guess, avance al segundo cruce cuando el primero ya tiene resultado, empate, puntos generales, los dos destinatarios posibles de Dinero Rápido y carga manual tras un error de lectura. Pasaron las comprobaciones de sintaxis de los archivos `.js`.

**Pendiente para usar en el evento:** prueba real con el Firebase configurado, sus reglas y dos dispositivos; comprobar el resultado final en la tabla. Si Firebase se corta durante El Erudito, la pantalla no ofrece una partida local equivalente: habrá que llevar el marcador por separado y cargar el cruce manualmente desde `velada.html`. La prueba simulada no valida la latencia ni los permisos reales.

Antes del evento, probá una ronda con el panel y dos celulares conectados a tu Firebase real. La publicación, reglas de acceso y latencia reales no se validaron desde aquí.
