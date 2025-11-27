import React, { useState } from 'react';
import { Typography, Box, TextField, Checkbox, FormControlLabel, Button } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import { oneDark } from '@codemirror/theme-one-dark';
import { html } from '@codemirror/lang-html';
import CodeMirror from '@uiw/react-codemirror';
import GEO_LANG_MAP from '../../utils/geoLangMap';

const FormNormalizer = () => {
    const [inputText, setInputText] = useState('');
    const [offerName, setOfferName] = useState('');
    const [parsed, setParsed] = useState({
        category: '',
        geo: '',
        partner: '',
        lang: '',
        backlink: false,
        backlinkUrl: '',
        tempLeads: true
    });

    // Custom setParsed that automatically resets isNormalized
    const updateParsed = (updates) => {
        setParsed(prev => ({ ...prev, ...updates }));
        setIsNormalized(false);
    };
    const [formCount, setFormCount] = useState(null);
    const [normalizedOutput, setNormalizedOutput] = useState('');
    const [checkList, setCheckList] = useState({
        forms: false,
        formAttributes: false,
        hiddenInputs: false,
        tempLeadsScript: false,
        backlink: false
    });
    const [showValidation, setShowValidation] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isNormalized, setIsNormalized] = useState(false);

    const handleOfferNameChange = (e) => {
        const value = e.target.value;
        setOfferName(value);

        if (value.trim()) {
            const parts = value.split('_');
            let category = parts[0] || '';
            let geo = parts[1] && parts[1].length === 2 ? parts[1].toUpperCase() : '';
            let partner = parts[2] ? parts[2].toLowerCase() : '';
            let backlink = false;
            let tempLeads = true;

            // Determine lang from geo
            let lang = geo && GEO_LANG_MAP[geo] ? GEO_LANG_MAP[geo] : '';

            // Check for backlink markers in the rest of the parts
            for (let i = 3; i < parts.length; i++) {
                const part = parts[i];
                if (['ab', 'AB'].includes(part)) {
                    backlink = true;
                }
            }

            updateParsed({ category, geo, partner, lang, backlink, tempLeads });
            // Hide validation errors when user starts typing
            setShowValidation(false);
            // Reset normalized state when offer name changes
            setIsNormalized(false);
        } else {
            updateParsed({
                category: '',
                geo: '',
                partner: '',
                lang: '',
                backlink: false,
                backlinkUrl: '',
                tempLeads: true
            });
            // Hide validation errors when clearing
            setShowValidation(false);
        }
    };

    const handleBacklinkChange = (e) => {
        updateParsed({ backlink: e.target.checked });
        // Clear backlinkUrl when unchecking backlink
        if (!e.target.checked) {
            updateParsed({ backlinkUrl: '' });
        }
    };

    const handleTempLeadsChange = (e) => {
        updateParsed({ tempLeads: e.target.checked });
    };

    const handleNormalize = () => {
        // Validate required fields
        if (!parsed.geo || !parsed.lang || !parsed.partner) {
            setShowValidation(true);
            return;
        }
        // Validate backlink URL if backlink is checked
        if (parsed.backlink && !parsed.backlinkUrl) {
            setShowValidation(true);
            return;
        }
        // Validate backlink URL format if backlink is checked
        if (parsed.backlink && parsed.backlinkUrl) {
            const urlPattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;
            if (!urlPattern.test(parsed.backlinkUrl)) {
                setShowValidation(true);
                return;
            }
        }

        // Reset checkList
        setCheckList({
            forms: false,
            formAttributes: false,
            hiddenInputs: false,
            tempLeadsScript: false,
            backlink: false
        });

        let normalizedHtml = inputText;

        // Parse HTML and count forms
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(inputText, 'text/html');
            const forms = doc.querySelectorAll('form');
            setFormCount(forms.length);
            
            // Update forms check
            setCheckList(prev => ({ ...prev, forms: forms.length > 0 }));
            
            // If forms are found, normalize them
            if (forms.length > 0) {
                normalizedHtml = normalizeForms(inputText);
            }
        } catch (e) {
            console.log('error', e);
            setFormCount(0);
            setCheckList(prev => ({ ...prev, forms: false }));
        }
        
        normalizedHtml = insertTempLeadsScript(normalizedHtml);
        normalizedHtml = insertBackLinkScript(normalizedHtml, parsed.backlinkUrl);
        
        // Set the final output once
        setNormalizedOutput(normalizedHtml);
        // Mark as normalized
        setIsNormalized(true);
    };

    const normalizeForms = (htmlText) => {
        if (!htmlText || typeof htmlText !== "string") return htmlText;

        const lowerIndexOf = (hay, needle, from) =>
          hay.toLowerCase().indexOf(needle.toLowerCase(), from);
      
        let out = "";
        let i = 0;
      
        while (true) {
          // Find next <form ...>
          const openIdx = lowerIndexOf(htmlText, "<form", i);
          if (openIdx === -1) {
            // No more forms: append the rest and break
            out += htmlText.slice(i);
            break;
          }
      
          // Copy everything before the form untouched
          out += htmlText.slice(i, openIdx);
      
          // Find end of the opening tag '>'
          const openEnd = htmlText.indexOf(">", openIdx);
          if (openEnd === -1) {
            // Malformed (no '>'): give up on transforming; append rest and break
            out += htmlText.slice(openIdx);
            break;
          }
      
          const formOpen = htmlText.slice(openIdx, openEnd + 1);
      
          // Find the closing </form> for this form (HTML disallows nested <form>)
          const closeIdx = lowerIndexOf(htmlText, "</form", openEnd + 1);
          if (closeIdx === -1) {
            // No closing tag: keep as-is
            out += htmlText.slice(openIdx);
            break;
          }
          const closeEnd = htmlText.indexOf(">", closeIdx);
          if (closeEnd === -1) {
            out += htmlText.slice(openIdx);
            break;
          }
      
          const formInner = htmlText.slice(openEnd + 1, closeIdx);
          const formClose = htmlText.slice(closeIdx, closeEnd + 1);
      
          // --- Step 1: Cleanup opening tag attributes ---
          let newOpen = formOpen;
      
          // helper: ensure attr=value on opening tag (replace or insert)
          const ensureAttr = (tag, name, value) => {
            const re = new RegExp(
              `(\\b${name}\\s*=\\s*)(["']?)([^"'>\\s]*)(\\2)`,
              "i"
            );
            if (re.test(tag)) {
              return tag.replace(re, (_, p1, q, _old, p4) => `${p1}${q}${value}${p4}`);
            }
            // insert before the final '>'
            return tag.replace(/>$/, ` ${name}="${value}">`);
          };
      
          newOpen = ensureAttr(newOpen, "action", "success.php");
          newOpen = ensureAttr(newOpen, "method", "post");
      
          // --- Step 1: Cleanup inner HTML ---
          let newInner = formInner;
      
          // 1) Remove ALL hidden inputs (various quote/case/attribute orders)
          // with quoted value
          newInner = newInner.replace(
            /<input\b[^>]*\btype\s*=\s*(['"])hidden\1[^>]*>/gi,
            ""
          );
          // with unquoted value
          newInner = newInner.replace(
            /<input\b[^>]*\btype\s*=\s*hidden\b[^>]*>/gi,
            ""
          );
           
          // Clean up empty rows (lines with only whitespace)
          newInner = newInner.replace(/^\s*[\r\n]/gm, '');
       
          // 2) Rename selected input "name" values to "client"
          const targets = /^(name|username|user|firstname|fullname)$/i;
          newInner = newInner.replace(/<input\b[^>]*>/gi, (inputTag) => {
            // locate name attribute
            const nameRe = /\bname\s*=\s*(["'])(.*?)\1|\bname\s*=\s*([^\s>'"]+)/i;
            const m = nameRe.exec(inputTag);
            if (!m) return inputTag;
      
            const value = (m[2] ?? m[3] ?? "").trim();
            if (!targets.test(value)) return inputTag;
      
            // preserve the original quote style if present
            if (m[1]) {
              // had quotes
              return inputTag.replace(nameRe, `name=${m[1]}client${m[1]}`);
            } else {
              // no quotes originally
              return inputTag.replace(nameRe, `name=client`);
            }
          });
           
          // Update formAttributes check after processing
          setCheckList(prev => ({ ...prev, formAttributes: true }));
      
          // --- Step 2: Append required hidden fields before </form> ---
          const esc = (s) =>
            String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
      
          const hiddenFields =
            `<input type="hidden" name="country_code" value="${esc(parsed.geo)}">\n` +
            `<input type="hidden" name="lang" value="${esc(parsed.lang)}">\n` +
            `<input type="hidden" name="partner" value="${esc(parsed.partner)}">\n` +
            `<input type="hidden" name="px" value="{px}" />\n` +
            `<input type="hidden" name="clickid" value="{subid}" />\n` +
            `<input type="hidden" name="offer_id" value="{offer_id}" />\n` +
            `<input type="hidden" name="utm_source" value="{utm_source}" />\n` +
            `<input type="hidden" name="utm_content" value="{utm_content}" />\n` +
            `<input type="hidden" name="utm_campaign" value="{utm_campaign}" />\n` +
            `<input type="hidden" name="utm_term" value="{utm_term}" />\n` +
            `<input type="hidden" name="utm_medium" value="{utm_medium}" />\n`;
      
          const rebuiltForm = `${newOpen}${newInner}${hiddenFields}${formClose}`;
      
          out += rebuiltForm;
          i = closeEnd + 1; // continue scanning after this form
        }
      
        // Update hiddenInputs check after all forms are processed
        setCheckList(prev => ({ ...prev, hiddenInputs: true }));
      
        return out;
    };

    const insertBackLinkScript = (html, backlinkUrl) => {
        // Check if backlink scripts already exist with the same URL
        const existingScriptRegex = /<script[^>]*>[\s\S]*?window\.vitBack\("([^"]+)"[\s\S]*?<\/script>/;
        const match = html.match(existingScriptRegex);
        
        // If backlink is disabled, remove any existing backlink scripts
        if (!parsed.backlink) {
            if (match) {
                // Remove the backlink script block
                const scriptStart = html.indexOf('<script src="js/script_set.min.js"></script>');
                if (scriptStart !== -1) {
                    const scriptEnd = html.indexOf('</script>', scriptStart);
                    if (scriptEnd !== -1) {
                        const nextScriptEnd = html.indexOf('</script>', scriptEnd + 9);
                        if (nextScriptEnd !== -1) {
                            const beforeScript = html.substring(0, scriptStart);
                            const afterScript = html.substring(nextScriptEnd + 9);
                            setCheckList(prev => ({ ...prev, backlink: false }));
                            return beforeScript + afterScript;
                        }
                    }
                }
            }
            // No backlink scripts to remove
            setCheckList(prev => ({ ...prev, backlink: false }));
            return html;
        }
        
        // If backlink is enabled, check if script exists with same URL
        if (match && match[1] === backlinkUrl) {
            setCheckList(prev => ({ ...prev, backlink: true }));
            return html; // Script already exists with same URL, return unchanged
        }
        
        // If script exists but with different URL, remove the old script first
        let cleanHtml = html;
        if (match) {
            // Find and remove the specific backlink script block
            const scriptStart = html.indexOf('<script src="js/script_set.min.js"></script>');
            if (scriptStart !== -1) {
                // Find the end of the backlink script block
                const scriptEnd = html.indexOf('</script>', scriptStart);
                if (scriptEnd !== -1) {
                    // Find the next </script> tag to get the complete block
                    const nextScriptEnd = html.indexOf('</script>', scriptEnd + 9);
                    if (nextScriptEnd !== -1) {
                        // Remove the entire backlink script block
                        const beforeScript = html.substring(0, scriptStart);
                        const afterScript = html.substring(nextScriptEnd + 9);
                        cleanHtml = beforeScript + afterScript;
                    }
                }
            }
        }
        
        // Create the script tag with the backlink URL
        // Update hiddenInputs check after all forms are processed
        setCheckList(prev => ({ ...prev, backlink: true }));
        const scriptTag = `
        <script src="js/script_set.min.js"></script>
        <script>
            document.addEventListener("DOMContentLoaded", function () {
            window.vitBack("${backlinkUrl}" + "?", true);
            });
        </script>
        `;
        
        // Search for </body> tag
        const bodyCloseIndex = cleanHtml.indexOf('</body>');
        
        if (bodyCloseIndex !== -1) {
            // Insert the script tag before </body> and preserve everything after it
            return cleanHtml.substring(0, bodyCloseIndex) + scriptTag + '</body>' + cleanHtml.substring(bodyCloseIndex + 7);
        }
        
        // If no </body> tag found, append at the end
        return cleanHtml + scriptTag;
    };

    const insertTempLeadsScript = (html) => {
        // Check if temp leads script already exists
        if (html.includes('<script src="js/temp_leads.js"></script>')) {
            if (parsed.tempLeads) {
                setCheckList(prev => ({ ...prev, tempLeadsScript: true }));
                return html; // Script already exists and tempLeads is enabled, return unchanged
            } else {
                // Remove the temp leads script since tempLeads is disabled
                const cleanHtml = html.replace(/<script src="js\/temp_leads\.js"><\/script>/g, '');
                setCheckList(prev => ({ ...prev, tempLeadsScript: false }));
                return cleanHtml;
            }
        }
        
        // If script doesn't exist and tempLeads is enabled, add it
        if (parsed.tempLeads) {
            // Create the script tag for temp leads
            // Update tempLeadsScript check
            setCheckList(prev => ({ ...prev, tempLeadsScript: true }));
            const scriptTag = `<script src="js/temp_leads.js"></script>`;
            
            // Search for </body> tag
            const bodyCloseIndex = html.indexOf('</body>');
            
            if (bodyCloseIndex !== -1) {
                // Insert the script tag before </body> and preserve everything after it
                return html.substring(0, bodyCloseIndex) + scriptTag + '</body>' + html.substring(bodyCloseIndex + 7);
            }
            
            // If no </body> tag found, append at the end
            return html + scriptTag;
        }
        
        // If tempLeads is disabled and no script exists, return unchanged
        setCheckList(prev => ({ ...prev, tempLeadsScript: false }));
        return html;
    };

    const isValidUrl = (url) => {
        const urlPattern = /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}(\/.*)?$/;
        return urlPattern.test(url);
    };

    const handleCopy = (text) => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            });
        } else {
            // Fallback for insecure context or unsupported browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 1200);
            } catch (err) {
                // Optionally show an error message
            }
            document.body.removeChild(textarea);
        }
    };

    return (
        <Box>
            {/* <Typography variant="h4" gutterBottom>
                Forms normalizer
            </Typography> */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Box sx={{ flex: '1 1 30%', minWidth: 0 }}>
                    <TextField
                        size="small"
                        label="Offer name"
                        variant="outlined"
                        value={offerName}
                        placeholder='weightloss_be_leadbit_abslim_student_fr_AB'
                        onChange={handleOfferNameChange}
                        sx={{ mb: 2 }}
                        fullWidth
                    />
                </Box>
                <Box sx={{ flex: '3 3 70%', minWidth: 0 }}>
                    {/* <Box sx={{ mb: 2 }}> */}
                            {/* <TextField
                                label="Category"
                                variant="outlined"
                                value={parsed.category}
                                size="small"
                                onChange={(e) => updateParsed({ category: e.target.value })}
                            /> */}
                            <TextField
                                label="Geo"
                                variant="outlined"
                                value={parsed.geo}
                                size="small"
                                sx={{ width: 80 , mr: 1}}
                                error={showValidation && parsed.geo === ''}
                                helperText={showValidation && parsed.geo === '' ? "Required" : ""}
                                onChange={(e) => updateParsed({ geo: e.target.value })}
                            />
                            <TextField
                                label="Lang"
                                variant="outlined"
                                value={parsed.lang}
                                size="small"
                                sx={{ width: 80, mr: 1}}
                                error={showValidation && parsed.lang === ''}
                                helperText={showValidation && parsed.lang === '' ? "Required" : ""}
                                onChange={(e) => updateParsed({ lang: e.target.value })}
                            />
                            <TextField
                                label="Partner"
                                variant="outlined"
                                value={parsed.partner}
                                size="small"
                                sx={{ mr: 1}}
                                error={showValidation && parsed.partner === ''}
                                helperText={showValidation && parsed.partner === '' ? "Required" : ""}
                                onChange={(e) => updateParsed({ partner: e.target.value })}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={parsed.tempLeads}
                                        onChange={handleTempLeadsChange}
                                    />
                                }
                                label="Temp Leads"
                                sx={{ ml: 1 }}
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={parsed.backlink}
                                        onChange={handleBacklinkChange}
                                    />
                                }
                                label="Backlink"
                                sx={{ ml: 1 }}
                            />
                            {parsed.backlink && (
                                <TextField
                                    label="Backlink URL"
                                    variant="outlined"
                                    size="small"
                                    sx={{ width: 200 }}
                                    value={parsed.backlinkUrl || ''}
                                    onChange={(e) => updateParsed({ backlinkUrl: e.target.value })}
                                    error={showValidation && parsed.backlink && (!parsed.backlinkUrl || !isValidUrl(parsed.backlinkUrl))}
                                    helperText={
                                        showValidation && parsed.backlink && !parsed.backlinkUrl 
                                            ? "Required" 
                                            : showValidation && parsed.backlink && parsed.backlinkUrl && !isValidUrl(parsed.backlinkUrl)
                                            ? "Must be a valid URL starting with http:// or https://"
                                            : ""
                                    }
                                />
                            )}
                        
                    {/* </Box> */}
                </Box>
            </Box>

            <div>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    mb: 2,
                    width: '100%',
                }}>
                    <Box sx={{ 
                        flex: '1 1 50%',
                        minWidth: 0,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                            Input HTML
                        </Typography>
                            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                                <IconButton
                                    onClick={() => {
                                        if (inputText) {
                                            handleCopy(inputText);
                                        }
                                    }}
                                    disabled={!inputText}
                                    size="small"
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box height="400px" sx={{
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            width: '100%',
                        }}>
                            <CodeMirror
                                value={inputText}
                                height="400px"
                                theme={oneDark}
                                extensions={[html()]}
                                onChange={(value) => {
                                    setInputText(value);
                                    // Reset normalized state when input changes
                                    setIsNormalized(false);
                                }}
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ 
                        flex: '1 1 50%',
                        minWidth: 0,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                Normalized Output
                            </Typography>
                            <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
                                <IconButton
                                    onClick={() => {
                                        if (normalizedOutput) {
                                            handleCopy(normalizedOutput);
                                        }
                                    }}
                                    disabled={!normalizedOutput}
                                    size="small"
                                >
                                    <ContentCopyIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Box sx={{
                            border: '1px solid rgba(255, 255, 255, 0.23)',
                            borderRadius: '4px',
                            overflow: 'hidden',
                            width: '100%',
                        }}>
                            <CodeMirror
                                value={normalizedOutput || ''}
                                theme={oneDark}
                                extensions={[html()]}
                                editable={false}
                                height="400px"
                                basicSetup={{
                                    lineNumbers: true,
                                    highlightActiveLineGutter: true,
                                    highlightSpecialChars: true,
                                    foldGutter: true,
                                    drawSelection: true,
                                    dropCursor: true,
                                    allowMultipleSelections: true,
                                    indentOnInput: true,
                                    syntaxHighlighting: true,
                                    bracketMatching: true,
                                    closeBrackets: true,
                                    autocompletion: true,
                                    rectangularSelection: true,
                                    crosshairCursor: true,
                                    highlightActiveLine: true,
                                    highlightSelectionMatches: true,
                                    closeBracketsKeymap: true,
                                    searchKeymap: true,
                                    foldKeymap: true,
                                    completionKeymap: true,
                                    lintKeymap: true,
                                }}
                            />
                        </Box>
                    </Box>
                </Box>
            </div>

            
            <Box sx={{ textAlign: 'right', mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                    variant="outlined"
                    color="secondary"
                    size="large"
                    onClick={() => {
                        setIsNormalized(false);
                        setNormalizedOutput('');
                        setCheckList({
                            forms: false,
                            formAttributes: false,
                            hiddenInputs: false,
                            tempLeadsScript: false,
                            backlink: false
                        });
                    }}
                >
                    Reset
                </Button>
                <Button
                    disabled={!inputText.trim() || isNormalized}
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    size="large"
                    onClick={handleNormalize}
                >
                    {isNormalized ? 'Already Normalized' : 'Normalize'}
                </Button>
            </Box>
                  {/* CheckList Display */}
                  <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
                    Processing Status
                </Typography>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: '8px',
                    backgroundColor: (theme) => theme.palette.background.paper,
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color={checkList.forms ? "success" : "disabled"} />
                        <Typography variant="body2">Found {formCount} form{formCount === 1 ? '' : 's'}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color={checkList.formAttributes ? "success" : "disabled"} />
                        <Typography variant="body2">Check Form Attribute </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color={checkList.hiddenInputs ? "success" : "disabled"} />
                        <Typography variant="body2">Hidden Inputs</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color={checkList.tempLeadsScript ? "success" : "disabled"} />
                        <Typography variant="body2">Temp Leads Script</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleIcon color={checkList.backlink ? "success" : "disabled"} />
                        <Typography variant="body2">Backlink Script</Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
export default FormNormalizer;