const tabs = document.querySelectorAll('.tabs button');
const panels = document.querySelectorAll('.tab-content');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentTab = 0;

function showTab(index) {
    currentTab = index;

    // Update panels
    panels.forEach((panel, i) => {
        panel.classList.toggle('active', i === index);
    });

    // Update tab buttons
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === index);
    });

    // Update nav buttons
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === panels.length - 1;
}

function validateCurrentTab() {
    //const currentPanel = panels[currentTab];
    //const inputs = currentPanel.querySelectorAll('input');
    //
    //for (const input of inputs) {
    //    if (!input.checkValidity()) {
    //        input.reportValidity();
    //        return false;
    //    }
    //}
    //
    //return true;

    const currentPanel = panels[currentTab];
    const inputs = currentPanel.querySelectorAll('input, select, textarea');

    let isValid = true;

    inputs.forEach(input => {
        if (!input.checkValidity()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}


// Top tab clicks
tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        if (index > currentTab && !validateCurrentTab()) return;
        showTab(index);
    });
});


// Bottom buttons
prevBtn.addEventListener('click', () => {
    showTab(currentTab - 1);
});

nextBtn.addEventListener('click', () => {
    if (!validateCurrentTab()) return;
    showTab(currentTab + 1);
});


// Initialise
showTab(0);

const gainModeSelect = document.getElementById('gainMode');
const overallFields = document.getElementById('overallFields');
const customGainFields = document.getElementById('customGainFields');

function updateSdrFields() {
    overallFields.classList.add('hidden');
    customGainFields.classList.add('hidden');

    document
        .querySelectorAll('#overallFields input, #customGainFields input')
        .forEach(input => input.required = false);

    if (gainModeSelect.value === 'overall') {
        overallFields.classList.remove('hidden');
        document
            .querySelectorAll('#overallFields input')
            .forEach(input => input.required = true);
    }

    if (gainModeSelect.value === 'customGain') {
        customGainFields.classList.remove('hidden');
        document
            .querySelectorAll('#customGainFields input')
            .forEach(input => input.required = true);
    }
}

gainModeSelect.addEventListener('change', updateSdrFields);

// Initialise (important if user goes back)
updateSdrFields();

const rotatorEnabled = document.getElementById('rotatorEnabled');
const rotatorFields = document.getElementById('rotorFields');

function updateRotorFields() {
    rotatorFields.classList.add('hidden');

    document
        .querySelectorAll('#rotorFields input')
        .forEach(input => input.required = false);

    if (rotatorEnabled.checked == true) {
        rotatorFields.classList.remove('hidden');
        document
            .querySelectorAll('#rotorFields input')
            .forEach(input => input.required = true);
    }
}

rotatorEnabled.addEventListener('change', updateRotorFields);

// Initialise (important if user goes back)
updateRotorFields();






// Download button handling
const form = document.getElementById('wizardForm');
const downloadBtn = document.getElementById('downloadBtn');

downloadBtn.addEventListener('click', () => {
    if (!form.checkValidity()) {
        // form.reportValidity();
        validateCurrentTab();
        return;
    }

    const data = new FormData(form);
    const text = renderConfig(data);
    downloadTextFile(text, 'station.conf');
});

function renderConfig(data) {
    let output = '';

    output += `# General Settings\n`;
    output += `SATNOGS_STATION_ID="${data.get('stationId')}"\n`;
    output += `SATNOGS_STATION_LAT="${data.get('latitude')}"\n`;
    output += `SATNOGS_STATION_LON="${data.get('longitude')}"\n`;
    output += `SATNOGS_STATION_ELEV="${data.get('altitude')}"\n`;
    output += `SATNOGS_API_TOKEN="${data.get('apiToken')}"\n\n`;

    output += `# SDR Settings\n`;
    output += `SATNOGS_SOAPY_RX_DEVICE="driver=${data.get('sdrType')}"\n`;
    output += `SATNOGS_RX_SAMP_RATE="${data.get('sampRate')}"\n`;
    if (data.get('gainMode') === 'overall') { output += `SATNOGS_RF_GAIN="${data.get('overallGain')}"\n`; }
    if (data.get('gainMode') === 'customGain') { output += `SATNOGS_OTHER_SETTINGS="${data.get('customGain')}"\n`; }
    output += `SATNOGS_ANTENNA="${data.get('sdrAntenna')}"\n\n`;

    output += `# Rotator Settings\n`;
    output += `SATNOGS_ROT_ENABLED="${data.get('rotatorEnabled') ? "True" : "False"}"\n`;
    if (data.get('rotatorEnabled')) {
        output += `SATNOGS_ROT_MODEL="${data.get('rotorModel')}"\n`;
        output += `SATNOGS_ROT_BAUD="${data.get('rotorBaud')}"\n`;
        output += `SATNOGS_ROT_PORT="${data.get('rotorPort')}"\n`;
        output += `SATNOGS_ROT_THRESHOLD="${data.get('rotorThreshold')}"\n\n`;
    } else {
        output += `\n`
    }

    output += `# Misc\n`;
    output += `GR_SATELLITES_ENABLED="${data.get('grsatEnabled') ? "True" : "False"}"\n`;
    output += `GR_SATELLITES_KEEPLOGS="${data.get('grsatKeepLogs') ? "True" : "False"}"\n`;
    output += `ENABLE_IQ_DUMP="${data.get('dumpIQDataEnabled') ? "True" : "False"}"\n`;
    if (data.get('dumpIQDataEnabled'))
        output += `IQ_DUMP_FILENAME="${data.get('iqdataPath')}"\n`;
    output += `SATNOGS_ARTIFACTS_ENABLED="${data.get('artifactsUploadEnabled') ? "True" : "False"}"\n`;
    if (data.get('dbApiToken'))
        output += `SATNOGS_ARTIFACTS_API_TOKEN="${data.get('dbApiToken')}"\n`;
    if (data.get('preScriptEnabled'))
        output += `SATNOGS_PRE_OBSERVATION_SCRIPT="satnogs-pre {{ID}} {{FREQ}} {{TLE}} {{TIMESTAMP}} {{BAUD}} {{SCRIPT_NAME}}"\n`;
    if (data.get('postScriptEnabled'))
        output += `SATNOGS_POST_OBSERVATION_SCRIPT="satnogs-post {{ID}} {{FREQ}} {{TLE}} {{TIMESTAMP}} {{BAUD}} {{SCRIPT_NAME}}"\n`;
    output += `UDP_DUMP_HOST="0.0.0.0"\n`;

    return output;
}

/*function renderConfig(data) {
  let output = '';

  output += `[station]\n`;
  output += `id = ${data.get('stationId')}\n`;
  output += `latitude = ${data.get('latitude')}\n`;
  output += `longitude = ${data.get('longitude')}\n`;
  output += `api_token = ${data.get('apiToken')}\n\n`;

  output += `[sdr]\n`;
  output += `type = ${data.get('sdrType')}\n`;

  if (data.get('sdrType') === 'rtl') {
    output += `gain = ${data.get('rtlGain')}\n`;
  }

  if (data.get('sdrType') === 'lime') {
    output += `sample_rate = ${data.get('limeSampleRate')}\n`;
  }

  return output;
}*/

function downloadTextFile(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
}
