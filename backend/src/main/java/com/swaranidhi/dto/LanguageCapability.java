package com.swaranidhi.dto;

public class LanguageCapability {
    private String code;
    private String name;
    private String nativeName;
    private String script;
    private String region;
    private boolean speechRecognition;
    private boolean textUnderstanding;
    private boolean textToSpeech;
    private String status; // SUPPORTED, COMING_SOON
    private String samplePrompt;

    public LanguageCapability() {}

    public LanguageCapability(String code, String name, String nativeName, String script, String region,
                              boolean speechRecognition, boolean textUnderstanding, boolean textToSpeech,
                              String status, String samplePrompt) {
        this.code = code;
        this.name = name;
        this.nativeName = nativeName;
        this.script = script;
        this.region = region;
        this.speechRecognition = speechRecognition;
        this.textUnderstanding = textUnderstanding;
        this.textToSpeech = textToSpeech;
        this.status = status;
        this.samplePrompt = samplePrompt;
    }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getNativeName() { return nativeName; }
    public void setNativeName(String nativeName) { this.nativeName = nativeName; }

    public String getScript() { return script; }
    public void setScript(String script) { this.script = script; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public boolean isSpeechRecognition() { return speechRecognition; }
    public void setSpeechRecognition(boolean speechRecognition) { this.speechRecognition = speechRecognition; }

    public boolean isTextUnderstanding() { return textUnderstanding; }
    public void setTextUnderstanding(boolean textUnderstanding) { this.textUnderstanding = textUnderstanding; }

    public boolean isTextToSpeech() { return textToSpeech; }
    public void setTextToSpeech(boolean textToSpeech) { this.textToSpeech = textToSpeech; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSamplePrompt() { return samplePrompt; }
    public void setSamplePrompt(String samplePrompt) { this.samplePrompt = samplePrompt; }
}
