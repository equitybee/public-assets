  // --- Company Select Component Logic ---
window.addEventListener('pageshow', (event) => {
  // --- Clear the company search input ---
  const companySearchInputs = document.getElementsByClassName('company-search-input w-input');
  Array.from(companySearchInputs).forEach((companySearchInput) => {
    companySearchInput.value = '';
  });
  window.companySelector = { selectedCompany: null };
});
document.addEventListener('DOMContentLoaded', () => {
  const isMobileWidth = () => {
    return window.innerWidth < 480;
  }

  const mainFunction = () => {
    const environmentHost = window.location.host.replace(/^www\./, '');

    const companySearchComponents = document.getElementsByClassName('form-block-4 company-search-component w-form');
    const companySearchComponentsArray = Array.from(companySearchComponents);
    companySearchComponentsArray.forEach((companySearchComponent) => {
      // --- Selectors Setup ---
      const companySearchInput = companySearchComponent.getElementsByClassName('company-search-input w-input')[0];
      const companySearchResultWrapper = companySearchComponent.getElementsByClassName('company-search-result-wrapper')[0];
      const selectedCompanyImage = companySearchComponent.getElementsByClassName('image-114 selected-company-image')[0];
      const ctaButton = companySearchComponent.getElementsByClassName('company-search-cta w-button')[0];
      const enabledCTAChevron = companySearchComponent.getElementsByClassName('enabled-cta-chevron')[0];
      const disabledCTAChevron = companySearchComponent.getElementsByClassName('disabled-cta-chevron')[0];

      // --- Defaults Setup ---
      const placeholderLogo = selectedCompanyImage.src;
      const genericCompanyLogoSrc = 'https://cdn.prod.website-files.com/64900e9935d6666c4a958d3a/681718d46b64741741bdddbf_Generic.svg';
      selectedCompanyImage.onerror = () => {
        selectedCompanyImage.src = genericCompanyLogoSrc;
      };

      companySearchInput.value = '';
      let debounceTimeout;
      
      let isMouseOverResultWrapper = false;

      companySearchResultWrapper.addEventListener('mouseenter', () => {
        isMouseOverResultWrapper = true;
      });
      companySearchResultWrapper.addEventListener('mouseleave', () => {
        isMouseOverResultWrapper = false;
      });
      
      // --- Company Search Logic ---
      companySearchInput.addEventListener('focus', () => {
        companySearchInput.style.borderColor = '#5c6171';
        // Show the results if there is a query and results exist
        const query = companySearchInput.value.trim();
        if (query.length >= 2 && companySearchResultWrapper.innerHTML.trim() !== '') {
          companySearchResultWrapper.style.display = 'block';
        }
      });

      companySearchInput.addEventListener('blur', () => {
        // Reset border color on blur (reverts to CSS defined style)
        companySearchInput.style.borderColor = '#ced0d4';
        // Hide the results if there is a query
        const query = companySearchInput.value.trim();
        if (query.length >= 2 && !isMouseOverResultWrapper) {
          setTimeout(() => {
            companySearchResultWrapper.style.display = 'none';  
          }, 100);
        }
      });

      companySearchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
        }
      });

      companySearchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        const query = companySearchInput.value;

        // reset placeholder logo
        if (selectedCompanyImage.src !== placeholderLogo) {
          selectedCompanyImage.src = placeholderLogo;
        }

        // reset selected company object
        if (window.companySelector?.selectedCompany) {
          window.companySelector.selectedCompany = null;
        }

        if (!query || query.length < 2) {
          companySearchResultWrapper.style.display = 'none';
          companySearchResultWrapper.innerHTML = '';
          updateCtaButtonState();
          return;
        }

        updateCtaButtonState();

        debounceTimeout = setTimeout(() => {
          fetch(`https://gateway.${environmentHost}/general/company-select/search?q=${encodeURIComponent(query)}&privateOnly=true&limit=10`)
            .then((res) => res.json())
            .then((res) => {
            const { data } = res;
            companySearchResultWrapper.innerHTML = '';

            if (!data) {
              companySearchResultWrapper.style.display = 'none';
              return;
            }

            if (!data.length) {
              const noResultEl = document.createElement('div');
              noResultEl.className = 'company-search-no-result';
              noResultEl.style.padding = '16px';
              noResultEl.style.color = '#3d414d';
              noResultEl.style.fontSize = '14px';

              const searchQueryEl = document.createElement('strong');
              searchQueryEl.textContent = query;

              noResultEl.append(
                'No result found for ',
                searchQueryEl,
                '.',
                document.createElement('br'),
                'If you think we are missing a company, please let us know at: '
              );

              const emailLink = document.createElement('a');
              emailLink.href = 'mailto:startupbuilders@equitybee.com';
              emailLink.textContent = 'startupbuilders@equitybee.com';

              noResultEl.appendChild(emailLink);

              companySearchResultWrapper.appendChild(noResultEl);
              companySearchResultWrapper.style.display = 'block';
              return;
            }

            data.forEach((company) => {
              const companySearchResultItem = document.createElement('div');
              companySearchResultItem.className = 'company-search-result-item';
              // by default, the result item is hidden, so we have to set styles dynamically to show it
              // we might be able to optimize by hiding the container div instead
              companySearchResultItem.style.display = 'flex';
              companySearchResultItem.style.alignItems = 'center';
              companySearchResultItem.style.gap = '8px';
              companySearchResultItem.style.cursor = 'pointer';
              companySearchResultItem.style.transition = 'background-color 0.2s ease';
              companySearchResultItem.addEventListener('mouseover', () => {
                companySearchResultItem.style.backgroundColor = '#E7EEFE';
              });
              companySearchResultItem.addEventListener('mouseout', () => {
                companySearchResultItem.style.backgroundColor = 'white';
              });
              const companyLogoImg = document.createElement('img');
              companyLogoImg.src = company.logo || genericCompanyLogoSrc;
              companyLogoImg.onerror = () => {
                companyLogoImg.src = genericCompanyLogoSrc;
              };
              companyLogoImg.alt = company.name;
              companyLogoImg.style.width = '24px';
              companyLogoImg.style.height = '24px';
              companyLogoImg.style.borderRadius = '100%';

              const companyNameDiv = document.createElement('div');
              companyNameDiv.textContent = company.name;

              const companyDomainSmall = document.createElement('small');
              companyDomainSmall.textContent = company.domain;

              const companyInfoDiv = document.createElement('div');
              companyInfoDiv.appendChild(companyNameDiv);
              companyInfoDiv.appendChild(companyDomainSmall);

              companySearchResultItem.appendChild(companyLogoImg);
              companySearchResultItem.appendChild(companyInfoDiv);
              companySearchResultItem.onclick = () => {
                const selectedCompany = company;
                window.companySelector = { selectedCompany };
                // set the input value to the company name
                companySearchInput.value = selectedCompany.name;

                // Only show image if not mobile
                if (!isMobileWidth()) {
                  selectedCompanyImage.style.display = 'inline-flex';
                }
                selectedCompanyImage.src = selectedCompany.logo || genericCompanyLogoSrc;
                selectedCompanyImage.alt = selectedCompany.name;

                // hide the company search result wrapper
                companySearchResultWrapper.style.display = 'none';
                updateCtaButtonState();
              };
              companySearchResultWrapper.appendChild(companySearchResultItem);
            });

            companySearchResultWrapper.style.display = 'block';
          });
        }, 300); // Debounce delay
      });

      // --- CTA button logic ---

      // Set variables
      const disabledCTABackgroundColor = '#E7E8EA';  
      const enabledCTABackgroundColor = '#009f4d';
      const enabledCTABackgroundColorHover = '#2EB26A';
      const disabledCTATextColor = '#B6B8BF';
      const enabledCTATextColor = 'white'; 


      // CTA event listeners
      ctaButton.addEventListener('click', () => {
        const selectedCompany = window.companySelector?.selectedCompany;
        // const fallbackUrl = new URL(`${window.location.protocol}//${environmentHost}/employees/signup`)

        if (!selectedCompany) {
          // Per request - we don't want to redirect to the fallback URL
          // window.location.href = fallbackUrl;
          return;
        }

        if (!selectedCompany.name) {
          // Per request - we don't want to redirect to the fallback URL
          // window.location.href = fallbackUrl;
          return;
        }

        // Build the signup URL dynamically based on the current base URL
        const iplocation = window.iplocation || 'us';
        const equityBeeUrl = new URL(`${window.location.protocol}//${environmentHost}/employees/signup?iplocation=${iplocation}&funnelId=new-employee-funnel`);

        equityBeeUrl.searchParams.append('companyName', selectedCompany.name);
        if (selectedCompany.domain) {
          equityBeeUrl.searchParams.append('companyDomain', selectedCompany.domain);
        }
        if (selectedCompany.companyId) {
          equityBeeUrl.searchParams.append('companyId', selectedCompany.companyId);
        }
        if (selectedCompany.crunchbaseId) {
          equityBeeUrl.searchParams.append('crunchbaseId', selectedCompany.crunchbaseId);
        }

        // Get tracking parameters
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('ref')) equityBeeUrl.searchParams.append('ref', urlParams.get('ref'));
        if (urlParams.get('ad_id')) equityBeeUrl.searchParams.append('ad_id', urlParams.get('ad_id')); 
        if (urlParams.get('pt')) equityBeeUrl.searchParams.append('pt', urlParams.get('pt'));
        if (urlParams.get('pn')) equityBeeUrl.searchParams.append('pn', urlParams.get('pn'));
        if (urlParams.get('pme')) equityBeeUrl.searchParams.append('pme', urlParams.get('pme'));
        if (urlParams.get('lp_v')) equityBeeUrl.searchParams.append('lp_v', urlParams.get('lp_v'));
        if (urlParams.get('eb_sid')) equityBeeUrl.searchParams.append('eb_sid', urlParams.get('eb_sid'));
        if (urlParams.get('linkId')) equityBeeUrl.searchParams.append('linkId', urlParams.get('linkId'));

        // TODO: send event
        // eventName, eventProps = {}, userId = this.userId, userType = this.userType, sendOnce = false
        // window.nectar.sendEvent(
        //   "LP CTA Click",
        //   // { page: pathname, lastClickReferrer: document.referrer || null },
        //   // null,
        //   // Nectar.USER_TYPE.UNKNOWN
        // );

        // Redirect to the signup page
        window.location.href = equityBeeUrl;
      });

        // Add hover effects for CTA button
      ctaButton.addEventListener('mouseenter', () => {
        if (!ctaButton.disabled) {
          ctaButton.style.background = enabledCTABackgroundColorHover;
        }
      });

      ctaButton.addEventListener('mouseleave', () => {
        if (!ctaButton.disabled) {
          ctaButton.style.background = enabledCTABackgroundColor;
        }
      });

      // Prevent CTA drag
      ctaButton.addEventListener('dragstart', (event) => {
        event.preventDefault();
      });

      // Prevent drop on the search input
      companySearchInput.addEventListener('drop', (event) => {
        event.preventDefault();
      });

      // Set initial disabled state and styles
      ctaButton.disabled = true;
      ctaButton.style.background = disabledCTABackgroundColor;
      ctaButton.style.color = disabledCTATextColor;
      ctaButton.style.cursor = 'not-allowed';
      enabledCTAChevron && (enabledCTAChevron.style.display = 'none');
      disabledCTAChevron && (disabledCTAChevron.style.display = 'inline-block');


      // Helper functions
      const updateCtaButtonState = () => {
        const selectedCompany = window.companySelector?.selectedCompany;
        if (selectedCompany && selectedCompany.name) {
          ctaButton.disabled = false;
          ctaButton.style.background = enabledCTABackgroundColor;
          ctaButton.style.color = enabledCTATextColor;
          ctaButton.style.cursor = 'pointer';
          enabledCTAChevron && (enabledCTAChevron.style.display = 'inline-block');
          disabledCTAChevron && (disabledCTAChevron.style.display = 'none');
        } else {
          ctaButton.disabled = true;
          ctaButton.style.background = disabledCTABackgroundColor;
          ctaButton.style.color = disabledCTATextColor;
          ctaButton.style.cursor = 'not-allowed';
          enabledCTAChevron && (enabledCTAChevron.style.display = 'none');
          disabledCTAChevron && (disabledCTAChevron.style.display = 'inline-block');
        }
      }


      const updateSelectedCompanyImageVisibility = () => {
        if (isMobileWidth()) {
          selectedCompanyImage.style.display = 'none';
          companySearchInput.style.width = '100%';
        } else {
          selectedCompanyImage.style.display = 'inline-flex';
          companySearchInput.style.width = '375px';
        }
      }

      updateSelectedCompanyImageVisibility();
      window.addEventListener('resize', updateSelectedCompanyImageVisibility);
      
    });
  }; // End of mainFunction


// --- Optibase initialization and call to mainFunction ---
const TIMEOUT_MS = 2000;

let checkOptibase;

let isMainFunctionCalled = false;

// Start checking for Optibase
checkOptibase = setInterval(() => {
  if (
    window.optibaseScriptLoaded === true &&
    window.optibaseInitialized === true &&
    (
      window.optibaseActiveVariants?.length > 0
      || (new URLSearchParams(window.location.search).get('optibasePreviewVariant')?.startsWith('lp_gs:'))
    )
  ) {
    clearInterval(checkOptibase);
    isMainFunctionCalled = true;
    mainFunction();
  }
}, 100);

// Fallback timeout
setTimeout(() => {
  clearInterval(checkOptibase);
  if (!isMainFunctionCalled || !(window.optibaseScriptLoaded && window.optibaseInitialized) && !window.nectarInitialized) {
    mainFunction();
  }
}, TIMEOUT_MS);


  /* TBD
  * send events
*/

});