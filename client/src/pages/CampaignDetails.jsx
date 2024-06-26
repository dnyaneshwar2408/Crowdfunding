import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';

import { useStateContext } from '../context';
import { CountBox, CustomButton, Loader } from '../components';
import { calculateBarPercentage, daysLeft } from '../utils';
import { thirdweb } from '../assets';
import CountdownTimer  from '../components/CountdownTimer';
import { toast } from 'react-toastify';
import { UpdateCampaign } from '../pages'

const CampaignDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { donate, payOutToCampaignTeam, deleteCampaign, udpateCampaign, getDonations, contract, address } = useStateContext();

  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [donators, setDonators] = useState([]);

  const remainingDays = daysLeft(state.deadline);

  const fetchDonators = async () => {
    const data = await getDonations(state.pId);

    setDonators(data);
  }


  useEffect(() => {
    if(contract) fetchDonators();
  }, [contract, address])

  const handleDonate = async () => {
    setIsLoading(true);

    await donate(state.pId, amount); 

    navigate('/')
    setIsLoading(false);
  }

  const handleWithdraw = async () => {
      setIsLoading(true);
      
      await payOutToCampaignTeam(state.pId);
      
      navigate('/')
      setIsLoading(false);
  }

  const handleUpdate = async () => {
      setIsLoading(true);
      navigate(`/campaign-update/${state.pId}`)
      setIsLoading(false);
  }

  const handleDelete = async () => {
      setIsLoading(true);
      
      await deleteCampaign(state.pId);
      
      navigate('/')
      setIsLoading(false);
  }


  const compareAmounts = () => {
    const collected = parseFloat(ethers.utils.parseEther(state.amountCollected));
    const target = parseFloat(ethers.utils.parseEther(state.target));
    return (collected <= target)
  }

  return (
    <div>
      {isLoading && <Loader />}

      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-1 flex-col">
          <img src={state.image} alt="campaign" className="w-full h-[410px] object-cover rounded-xl shadow-lg"/>
          <div className="relative w-full h-[5px] bg-slate-600 mt-2">
            <div className="absolute h-full bg-col-2" style={{ width: `${calculateBarPercentage(state.target, state.amountCollected)}%`, maxWidth: '100%'}}>
            </div>
          </div>
        </div>

        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[30px]">
          <CountdownTimer title="Left" targetDate={state.deadline} />
          {/* <CountBox title="Days Left" value={remainingDays} /> */}
          <CountBox title={`Raised of ${state.target}ETH`} value={state.amountCollected} />
          <CountBox title="Total Backers" value={donators.length} />
        </div>
      </div>

      <div className="mt-[60px] flex lg:flex-row flex-col gap-5">
      <div className="flex-1">
          <h4 className="font-epilogue font-semibold text-[18px] text-slate-700 uppercase">Fund</h4>   
          <div className="mt-[20px] flex flex-col p-4 bg-col-3 rounded-[10px]">
            <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center text-white">
              Fund the campaign
            </p>
            <div className="mt-[30px]">
            {remainingDays >= 0 && compareAmounts() ? (
              <input 
                type="number"
                placeholder="ETH 0.1"
                step="0.01"
                className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue text-slate-700 text-[18px] leading-[30px] placeholder:text-slate-400 rounded-[10px]"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              /> ) : (<h1></h1>)}

              <div className="my-[20px] p-4 bg-col-1 rounded-[10px]">
                <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] text-slate-700">Back it because you believe in it.</h4>
                <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-slate-600]">Support the project for no reward, just because it speaks to you.</p>
              </div>
                <CustomButton 
                btnType="button"
                title={remainingDays >= 0 && compareAmounts() ? "Fund Campaign" : 
                (state.owner == address && (remainingDays == 0 || !compareAmounts())) ? "Withdraw Funds" : "Finished"}
                styles="w-full bg-[#8c6dfd]"
                handleClick={() => {
                  if(remainingDays >= 0 && compareAmounts()) handleDonate()
                  if(state.owner == address) {
                    if((remainingDays == 0 || !compareAmounts())) handleWithdraw()
                  }  
                }}
                /> <br/><br/>
                {state.owner == address ? 
                ( 
                  <CustomButton 
                  btnType="button"
                  title={remainingDays >= 0 && compareAmounts() ?  
                  "Edit" : "" }
                  styles="w-full bg-[#8c6dfd]"
                  handleClick={() => {
                    if(state.owner == address) handleUpdate()
                  }}
                  />
                ) : ""
              } <br/><br/>
                {state.owner == address ? 
                  (
                    <CustomButton 
                    btnType="button"
                    title={remainingDays >= 0 && compareAmounts() ?  
                    "Delete" : "" }
                    styles="w-full bg-[#8c6dfd]"
                    handleClick={() => {
                      if(state.owner == address) handleDelete(state.pId)
                    }}
                    />
                  ) : "" 
                }
            </div>
          </div>
        </div>
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-slate-700 uppercase">Creator</h4>

            <div className="mt-[20px] flex flex-row items-center flex-wrap gap-[14px]">
              <div className="w-[52px] h-[52px] flex items-center justify-center rounded-full bg-[#2c2f32] cursor-pointer">
                <img src={thirdweb} alt="user" className="w-[60%] h-[60%] object-contain"/>
              </div>
              <div>
                <h4 className="font-epilogue font-semibold text-[14px] text-slate-700 break-all">{state.owner}</h4>
                <p className="mt-[4px] font-epilogue font-normal text-[12px] text-slate-600">10 Campaigns</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-slate-700 uppercase">Story</h4>

              <div className="mt-[20px]">
                <p className="font-epilogue font-normal text-[16px] text-slate-600 leading-[26px] text-justify">{state.description}</p>
              </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] text-slate-700 uppercase">Donators</h4>

              <div className="mt-[20px] flex flex-col gap-4">
                {donators.length > 0 ? donators.map((item, index) => (
                  <div key={`${item.donator}-${index}`} className="flex justify-between items-center gap-4">
                    <p className="font-epilogue font-normal text-[16px] text-slate-500 leading-[26px] break-ll">{index + 1}. {item.donator}</p>
                    <p className="font-epilogue font-normal text-[16px] text-slate-600 leading-[26px] break-ll">{item.donation}</p>
                  </div>
                )) : (
                  <p className="font-epilogue font-normal text-[16px] text-slate-600 leading-[26px] text-justify">No donators yet. Be the first one!</p>
                )}
              </div>
          </div>
        </div>


      </div>
    </div>
  )
}

export default CampaignDetails