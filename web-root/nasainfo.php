<?php
    $catalogURLTemplate = 'http://nssdc.gsfc.nasa.gov/nmc/masterCatalog.do?sc=%s';
    $designator = htmlspecialchars($_GET['intldes']);
    $redirect = filter_var($_GET['redirect'], FILTER_VALIDATE_BOOLEAN);

    if ($designator) {
        if ($redirect) {
            header('Location: ' . sprintf($catalogURLTemplate, $designator), true, 302);
            exit;
        } else {
            $catalogEntryHtml = file_get_contents(sprintf($catalogURLTemplate, $designator));

            if ($catalogEntryHtml) {
                $catalogEntryDocument = new DOMDocument();
                if ($catalogEntryDocument->loadHTML($catalogEntryHtml)) {
                    $xpath = new DOMXPath($catalogEntryDocument);

                    $match = $xpath->query('//div[@id="contentwrapper"]//div[@class="urone"]');
                    if ($match->length > 0) {
                        $description = '';
                        $descriptionParts = $match[0]->childNodes;
                        for ($i = 1; $i < $descriptionParts->length; ++$i) {
                            $description .= trim($descriptionParts[$i]->nodeValue);
                        }

                        header('Content-Type: text/json', true, 200);

                        $data = array(
                            'description' => $description
                        );

                        echo json_encode($data);

                        exit;
                    }
                }
            }
        }
    }

    // fall back - if any error happened during data extraction above, return 404
    header($_SERVER['SERVER_PROTOCOL'].' 404 Not Found', true, 404);
?>
